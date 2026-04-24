const express = require('express');
const config = require('../config');
const v8 = require('../services/mockDataV8');

const router = express.Router();

// SASE
router.get('/sase/overview',  (req, res) => res.json(v8.saseOverview()));
router.get('/sase/ztna-apps', (req, res) => res.json(v8.saseZtnaApps()));

// Switches
router.get('/switches',       (req, res) => res.json(v8.switchList()));
router.get('/switches/:name', (req, res) => {
  const sw = v8.switchDetail(req.params.name);
  if (!sw) return res.status(404).json({ error: 'Switch not found' });
  res.json(sw);
});

// APs
router.get('/aps',            (req, res) => res.json(v8.apList()));
router.get('/aps/ssid-config', (req, res) => res.json(v8.apSsidConfig()));

// Change calendar
router.get('/calendar',       (req, res) => res.json(v8.changeCalendar()));

// Config diff - lives under /api/policy/packages/:name/diff
router.get('/policy/packages/:name/diff', (req, res) => {
  const diff = v8.configDiff(req.params.name, req.query.at);
  if (!diff) return res.status(404).json({ error: 'Package not found' });
  res.json(diff);
});

module.exports = router;
