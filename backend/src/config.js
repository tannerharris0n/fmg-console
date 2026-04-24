'use strict';
require('dotenv').config();

function parseBool(v, fallback = false) {
  if (v === undefined || v === null || v === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(v));
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8300', 10),
  logLevel: process.env.LOG_LEVEL || 'info',

  fmg: {
    host: process.env.FMG_HOST || '',
    port: parseInt(process.env.FMG_PORT || '443', 10),
    user: process.env.FMG_USER || '',
    password: process.env.FMG_PASSWORD || '',
    verifyTls: parseBool(process.env.FMG_VERIFY_TLS, true),
    defaultAdom: process.env.FMG_DEFAULT_ADOM || 'root',
  },

  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  },

  useMockData: parseBool(process.env.USE_MOCK_DATA, true),
  devSkipAuth: parseBool(process.env.DEV_SKIP_AUTH, false),
  demoMode: parseBool(process.env.DEMO_MODE, false),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

config.isProduction = config.env === 'production';

// Demo mode is a superset: force mock data and bypass auth so the public
// demo deployment renders without requiring a real FMG or a Supabase project.
// All mutating HTTP verbs are rejected by the readOnly middleware.
if (config.demoMode) {
  config.useMockData = true;
  config.devSkipAuth = true;
}

module.exports = config;
