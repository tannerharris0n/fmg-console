'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.deviceFleet());
    const client = getDefaultClient();
    const adom = req.query.adom || config.fmg.defaultAdom;
    const raw = await client.listDevices(adom);
    res.json(
      raw.map((d) => ({
        name: d.name,
        ip: d.ip,
        platform: d.platform_str,
        firmware: `${d.os_ver}.${d.mr}.${d.patch}`,
        haMode: d.ha_mode,
        status: d.conn_status === 0 ? 'offline' : 'ok',
        raw: d,
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
