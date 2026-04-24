'use strict';
const pino = require('pino');
const config = require('./config');

const logger = pino({
  level: config.logLevel,
  base: { service: 'fmg-console-backend' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
