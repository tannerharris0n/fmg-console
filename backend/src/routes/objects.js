'use strict';
const express = require('express');
const config = require('../config');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/addresses', async (req, res, next) => {
  try {
    if (config.useMockData) {
      return res.json([
        { name: 'CORP-VLANS', type: 'group', members: 12 },
        { name: 'PRINTERS',   type: 'group', members: 8 },
        { name: 'SERVERS-PROD', type: 'iprange', subnet: '10.10.0.0/16' },
      ]);
    }
    const client = getDefaultClient();
    const adom = req.query.adom || config.fmg.defaultAdom;
    const raw = await client.listAddressObjects(adom);
    res.json(raw);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
