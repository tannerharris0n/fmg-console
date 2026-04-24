'use strict';
const config = require('../config');
const logger = require('../logger');
const { verifyAccessToken } = require('../services/supabase');

/**
 * Reads the Authorization header, validates the Supabase access token,
 * and attaches req.user. Returns 401 on failure.
 *
 * In dev you can set DEV_SKIP_AUTH=true to bypass verification entirely.
 * Never do that in production.
 */
async function requireAuth(req, res, next) {
  if (config.devSkipAuth) {
    req.user = { id: 'dev-local', email: 'dev@local', dev: true };
    return next();
  }

  const header = req.header('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'missing bearer token' });
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    logger.debug('auth: token invalid');
    return res.status(401).json({ error: 'invalid token' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
