'use strict';
/**
 * FortiManager JSON-RPC client.
 *
 * Wraps axios with session login/logout, transparent re-auth on session
 * expiry, and small helpers for the common JSON-RPC verbs (get, exec, set,
 * add, delete, update, clone, move).
 *
 * API reference:
 *   https://docs.fortinet.com/document/fortimanager/8.0.0/api-best-practices
 */

const axios = require('axios');
const https = require('https');
const config = require('../config');
const logger = require('../logger');

const JSONRPC_PATH = '/jsonrpc';
const SESSION_IDLE_TTL_MS = 5 * 60 * 1000;

class FmgClient {
  constructor(opts = {}) {
    this.host = opts.host || config.fmg.host;
    this.port = opts.port || config.fmg.port;
    this.user = opts.user || config.fmg.user;
    this.password = opts.password || config.fmg.password;
    this.verifyTls = opts.verifyTls !== undefined ? opts.verifyTls : config.fmg.verifyTls;

    this.session = null;
    this.lastUsedAt = 0;
    this.requestId = 1;

    this.axios = axios.create({
      baseURL: `https://${this.host}:${this.port}`,
      timeout: 30000,
      httpsAgent: new https.Agent({ rejectUnauthorized: this.verifyTls }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  _nextId() {
    this.requestId = (this.requestId + 1) % 1_000_000;
    return this.requestId;
  }

  _isSessionStale() {
    if (!this.session) return true;
    return Date.now() - this.lastUsedAt > SESSION_IDLE_TTL_MS;
  }

  async login() {
    const payload = {
      id: this._nextId(),
      method: 'exec',
      params: [{
        url: '/sys/login/user',
        data: { user: this.user, passwd: this.password },
      }],
    };

    logger.debug({ host: this.host, user: this.user }, 'fmg: login');
    const { data } = await this.axios.post(JSONRPC_PATH, payload);
    const status = data?.result?.[0]?.status;

    if (!status || status.code !== 0) {
      const msg = status?.message || 'unknown error';
      logger.error({ status }, 'fmg: login failed');
      const err = new Error(`FMG login failed: ${msg}`);
      err.code = status?.code;
      throw err;
    }

    this.session = data.session;
    this.lastUsedAt = Date.now();
    logger.info({ host: this.host }, 'fmg: logged in');
    return this.session;
  }

  async logout() {
    if (!this.session) return;
    try {
      const payload = {
        id: this._nextId(),
        method: 'exec',
        params: [{ url: '/sys/logout' }],
        session: this.session,
      };
      await this.axios.post(JSONRPC_PATH, payload);
      logger.info('fmg: logged out');
    } catch (err) {
      logger.warn({ err: err.message }, 'fmg: logout failed (ignored)');
    } finally {
      this.session = null;
    }
  }

  async ensureSession() {
    if (this._isSessionStale()) {
      if (this.session) {
        logger.debug('fmg: session stale, re-authenticating');
        this.session = null;
      }
      await this.login();
    }
  }

  /**
   * Low-level request. Handles session auto-refresh on code 11 (session expired).
   */
  async request(method, params, retry = true) {
    await this.ensureSession();

    const payload = {
      id: this._nextId(),
      method,
      params: Array.isArray(params) ? params : [params],
      session: this.session,
    };

    const started = Date.now();
    try {
      const { data } = await this.axios.post(JSONRPC_PATH, payload);
      this.lastUsedAt = Date.now();

      // FMG returns status per-param in result[]
      const results = data?.result || [];
      const failed = results.find((r) => r?.status?.code !== 0);

      if (failed) {
        const code = failed.status.code;
        const msg = failed.status.message;

        if (code === 11 && retry) {
          logger.debug('fmg: session expired, re-logging in');
          this.session = null;
          await this.login();
          return this.request(method, params, false);
        }

        const err = new Error(`FMG ${method} failed: ${msg}`);
        err.code = code;
        err.fmgStatus = failed.status;
        throw err;
      }

      logger.debug(
        { method, params: Array.isArray(params) ? params[0]?.url : params?.url, ms: Date.now() - started },
        'fmg: ok'
      );
      return data;
    } catch (err) {
      if (err.fmgStatus) throw err;
      logger.error({ err: err.message, method }, 'fmg: request failed');
      throw err;
    }
  }

  /** Convenience helpers that wrap request(). */
  get(url, params = {}) {
    return this.request('get', { url, ...params });
  }
  add(url, data, params = {}) {
    return this.request('add', { url, data, ...params });
  }
  set(url, data, params = {}) {
    return this.request('set', { url, data, ...params });
  }
  update(url, data, params = {}) {
    return this.request('update', { url, data, ...params });
  }
  del(url, params = {}) {
    return this.request('delete', { url, ...params });
  }
  exec(url, data, params = {}) {
    return this.request('exec', { url, data, ...params });
  }
  clone(url, data, params = {}) {
    return this.request('clone', { url, data, ...params });
  }
  move(url, data, params = {}) {
    return this.request('move', { url, data, ...params });
  }

  // --- High-level helpers used by routes ---------------------------------

  /** `/dvmdb/adom` - list ADOMs */
  async listAdoms() {
    const res = await this.get('/dvmdb/adom');
    return res?.result?.[0]?.data || [];
  }

  /** `/dvmdb/adom/<adom>/device` - list managed devices in an ADOM */
  async listDevices(adom = config.fmg.defaultAdom) {
    const res = await this.get(`/dvmdb/adom/${encodeURIComponent(adom)}/device`);
    return res?.result?.[0]?.data || [];
  }

  /** `/pm/pkg/adom/<adom>` - list policy packages */
  async listPolicyPackages(adom = config.fmg.defaultAdom) {
    const res = await this.get(`/pm/pkg/adom/${encodeURIComponent(adom)}`);
    return res?.result?.[0]?.data || [];
  }

  /** `/pm/config/adom/<adom>/obj/firewall/address` - address objects */
  async listAddressObjects(adom = config.fmg.defaultAdom) {
    const res = await this.get(
      `/pm/config/adom/${encodeURIComponent(adom)}/obj/firewall/address`
    );
    return res?.result?.[0]?.data || [];
  }

  /** `/task/task` - running and recent tasks */
  async listTasks({ limit = 50 } = {}) {
    const res = await this.get('/task/task', {
      option: ['object member'],
      filter: [['percent', '<', 100], '||', ['percent', '>=', 100]],
      range: [0, limit],
    });
    return res?.result?.[0]?.data || [];
  }

  /** `/sys/status` - system status of the FortiManager itself */
  async sysStatus() {
    const res = await this.get('/sys/status');
    return res?.result?.[0]?.data || null;
  }
}

/**
 * Singleton default client using env-configured credentials.
 * Multi-FMG support (per-user connections) is a v0.2 concern; for now one
 * FMG per deployment via .env is fine.
 */
let defaultClient = null;
function getDefaultClient() {
  if (!defaultClient) defaultClient = new FmgClient();
  return defaultClient;
}

module.exports = { FmgClient, getDefaultClient };
