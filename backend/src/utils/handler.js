'use strict';
const config = require('../config');
const mock = require('../services/mockData');
const { getDefaultClient } = require('../services/fmgClient');

/**
 * Wrap a route handler so it picks mock data in dev mode and the real FMG
 * client otherwise. If the live FMG call throws we surface a 502, not 500,
 * so the frontend can distinguish upstream problems from app bugs.
 */
function useMockOr(liveFn) {
  return async (req, res, next) => {
    try {
      if (config.useMockData) return res.json(mock[req.mockKey]?.(req) ?? {});
      const client = getDefaultClient();
      const result = await liveFn(client, req, res);
      res.json(result);
    } catch (err) {
      if (err.code && !err.status) err.status = 502;
      next(err);
    }
  };
}

module.exports = { useMockOr };
