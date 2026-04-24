'use strict';
const express = require('express');
const config = require('../config');
const extra = require('../services/mockDataExtra');

const router = express.Router();

router.get('/', (req, res) => {
  if (config.useMockData) return res.json(extra.settings());
  res.status(501).json({ error: 'Live settings not wired yet.' });
});

module.exports = router;
