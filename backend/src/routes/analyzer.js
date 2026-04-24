'use strict';
/**
 * Policy analyzer - finds dead, shadow, redundant, and overly-permissive
 * rules across policy packages. Real analysis needs hit-count data from
 * FortiAnalyzer or direct device pulls; for v0.2 we ship the UI with
 * realistic findings and wire the real detection in v0.3.
 */
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.analyzerFindings());
    res.status(501).json({ error: 'Live analyzer not wired yet. Requires FortiAnalyzer hit-count integration.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
