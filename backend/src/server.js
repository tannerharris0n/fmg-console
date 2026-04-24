'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./logger');
const { requireAuth } = require('./middleware/auth');
const { readOnly } = require('./middleware/readOnly');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const health = require('./routes/health');
const dashboard = require('./routes/dashboard');
const devices = require('./routes/devices');
const policies = require('./routes/policies');
const objects = require('./routes/objects');
const tasks = require('./routes/tasks');
const adoms = require('./routes/adoms');
const preferences = require('./routes/preferences');
const install = require('./routes/install');
const analyzer = require('./routes/analyzer');
const security = require('./routes/security');
const fabric = require('./routes/fabric');

const app = express();

// Railway / Cloudflare sit in front of the app. Trust one proxy hop so
// rate limiting and req.ip reflect the real client, not the proxy.
app.set('trust proxy', 1);

// ---- Global middleware --------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // relaxed; frontend is served same-origin in prod
}));
app.use(compression());
app.use(cors({
  origin: config.isProduction ? true : config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));

// Demo deployments block all non-idempotent verbs before routes see them.
app.use('/api', readOnly);

const limiter = rateLimit({
  windowMs: 60_000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ---- Routes -------------------------------------------------------------
app.use('/api/health', health);

// Every real route below requires a valid Supabase session (unless DEV_SKIP_AUTH=true)
app.use('/api/dashboard',   requireAuth, dashboard);
app.use('/api/devices',     requireAuth, devices);
app.use('/api/policy',      requireAuth, policies);
app.use('/api/objects',     requireAuth, objects);
app.use('/api/tasks',       requireAuth, tasks);
app.use('/api/adoms',       requireAuth, adoms);
app.use('/api/preferences', requireAuth, preferences);
app.use('/api/install',     requireAuth, install);
app.use('/api/analyzer',    requireAuth, analyzer);
app.use('/api/security',    requireAuth, security);
app.use('/api/fabric',      requireAuth, fabric);

// ---- Serve the React build in production -------------------------------
if (config.isProduction) {
  const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ---- Error handling -----------------------------------------------------
app.use('/api', notFound);
app.use(errorHandler);

// ---- Start --------------------------------------------------------------
const server = app.listen(config.port, () => {
  logger.info(
    { port: config.port, env: config.env, mock: config.useMockData, skipAuth: config.devSkipAuth },
    'fmg-console backend listening'
  );
});

function shutdown(signal) {
  logger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
