'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const extra = require('../services/mockDataExtra');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/packages', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.policyPackages());
    const client = getDefaultClient();
    const adom = req.query.adom || config.fmg.defaultAdom;
    const raw = await client.listPolicyPackages(adom);
    res.json(raw);
  } catch (err) {
    next(err);
  }
});

router.get('/packages/:name', (req, res) => {
  if (config.useMockData) {
    const detail = extra.policyPackageDetail(req.params.name);
    if (!detail) return res.status(404).json({ error: `Package "${req.params.name}" not found.` });
    return res.json(detail);
  }
  res.status(501).json({ error: 'Live package detail not wired yet.' });
});

router.get('/heatmap', async (req, res, next) => {
  try {
    // Heatmap data needs hit-count aggregation which FMG doesn't surface
    // directly - that comes from FortiAnalyzer or per-device hitcount pulls.
    // For v0.1 we always return mock here; the real aggregation is a v0.2 concern.
    res.json(mock.policyHeatmap());
  } catch (err) {
    next(err);
  }
});

router.get('/profiles', (req, res) => {
  if (config.useMockData) return res.json(extra.policyProfiles());
  res.status(501).json({ error: 'Live profiles not wired yet.' });
});

router.get('/profiles/:type/:name', (req, res) => {
  if (config.useMockData) return res.json(extra.policyProfileDetail(req.params.type, req.params.name));
  res.status(501).json({ error: 'Live profile detail not wired yet.' });
});

module.exports = router;
