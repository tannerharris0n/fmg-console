'use strict';
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../logger');

let client = null;

function getSupabase() {
  if (client) return client;
  if (!config.supabase.url || !config.supabase.serviceKey) {
    logger.warn('supabase: not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)');
    return null;
  }
  client = createClient(config.supabase.url, config.supabase.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  logger.info('supabase: client ready');
  return client;
}

/**
 * Verify a Supabase access token and return the user, or null.
 * Uses the Supabase admin API so we don't have to implement JWT verification
 * ourselves.
 */
async function verifyAccessToken(token) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (err) {
    logger.warn({ err: err.message }, 'supabase: token verify failed');
    return null;
  }
}

module.exports = { getSupabase, verifyAccessToken };
