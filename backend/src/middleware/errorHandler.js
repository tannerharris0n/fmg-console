'use strict';
const logger = require('../logger');

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: err.message || 'internal error',
    code: err.code,
  };
  if (status >= 500) {
    logger.error({ err: err.message, stack: err.stack, path: req.path }, 'unhandled error');
  } else {
    logger.warn({ err: err.message, path: req.path }, 'handled error');
  }
  res.status(status).json(payload);
}

function notFound(req, res) {
  res.status(404).json({ error: 'not found', path: req.path });
}

module.exports = { errorHandler, notFound };
