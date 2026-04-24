'use strict';
const config = require('../config');

/**
 * When DEMO_MODE is on, reject anything that isn't a read. Keeps the demo
 * deployment safe without having to audit every route for accidental writes.
 */
function readOnly(req, res, next) {
  if (!config.demoMode) return next();
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();
  return res.status(403).json({
    error: 'This is a read-only demo. Mutations are disabled.',
    demo: true,
  });
}

module.exports = { readOnly };
