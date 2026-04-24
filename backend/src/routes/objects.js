'use strict';
const express = require('express');
const config = require('../config');
const extra = require('../services/mockDataExtra');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(extra.policyObjects());
    res.status(501).json({ error: 'Live objects not wired yet.' });
  } catch (err) {
    next(err);
  }
});

router.get('/addresses', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(extra.policyObjects().addresses);
    const client = getDefaultClient();
    const adom = req.query.adom || config.fmg.defaultAdom;
    const raw = await client.listAddressObjects(adom);
    res.json(raw);
  } catch (err) {
    next(err);
  }
});

router.get('/services',  (req, res) => res.json(extra.policyObjects().services));
router.get('/schedules', (req, res) => res.json(extra.policyObjects().schedules));
router.get('/vips',      (req, res) => res.json(extra.policyObjects().vips));

router.get('/:name/usage', (req, res) => {
  if (config.useMockData) return res.json(extra.policyObjectDetail(req.params.name));
  res.status(501).json({ error: 'Live object usage not wired yet.' });
});

module.exports = router;
