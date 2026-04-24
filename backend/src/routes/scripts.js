'use strict';
const express = require('express');
const config = require('../config');
const extra = require('../services/mockDataExtra');

const router = express.Router();

router.get('/', (req, res) => {
  if (config.useMockData) {
    return res.json({
      library: extra.scriptLibrary(),
      recentRuns: extra.scriptRuns(),
    });
  }
  res.status(501).json({ error: 'Live scripts not wired yet.' });
});

router.get('/library',   (req, res) => res.json(extra.scriptLibrary()));
router.get('/runs',      (req, res) => res.json(extra.scriptRuns()));

router.get('/library/:id', (req, res) => {
  const script = extra.scriptLibrary().find((s) => s.id === req.params.id);
  if (!script) return res.status(404).json({ error: 'Not found' });
  res.json(script);
});

module.exports = router;
