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
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

config.isProduction = config.env === 'production';

module.exports = config;
