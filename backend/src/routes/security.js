'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const extra = require('../services/mockDataExtra');

const router = express.Router();

router.get('/drift', (req, res) => {
  if (config.useMockData) return res.json(mock.driftAlerts());
  res.status(501).json({ error: 'Live drift detection not wired yet.' });
});

router.get('/drift/:device', (req, res) => {
  if (config.useMockData) return res.json(mock.driftDetail(req.params.device));
  res.status(501).json({ error: 'Live drift detail not wired yet.' });
});

router.get('/cves', (req, res) => {
  if (config.useMockData) return res.json(mock.cveWatchlist());
  res.status(501).json({ error: 'Live CVE feed not wired yet.' });
});

router.get('/cves/:id', (req, res) => {
  if (config.useMockData) return res.json(mock.cveDetail(req.params.id));
  res.status(501).json({ error: 'Live CVE detail not wired yet.' });
});

router.get('/audit', (req, res) => {
  if (config.useMockData) return res.json(mock.adminAudit());
  res.status(501).json({ error: 'Live audit not wired yet.' });
});

router.get('/audit/log', (req, res) => {
  if (config.useMockData) return res.json(extra.adminAuditLog());
  res.status(501).json({ error: 'Live audit log not wired yet.' });
});

router.get('/threats', (req, res) => {
  if (config.useMockData) return res.json(mock.threatActivity());
  res.status(501).json({ error: 'Live threat data not wired yet.' });
});

router.get('/threats/events', (req, res) => {
  if (config.useMockData) return res.json(extra.threatEvents());
  res.status(501).json({ error: 'Live threat events not wired yet.' });
});

router.get('/threats/top-sources', (req, res) => {
  if (config.useMockData) return res.json(extra.threatTopSources());
  res.status(501).json({ error: 'Live threat sources not wired yet.' });
});

router.get('/threats/top-targets', (req, res) => {
  if (config.useMockData) return res.json(extra.threatTopTargets());
  res.status(501).json({ error: 'Live threat targets not wired yet.' });
});

module.exports = router;
