'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const extra = require('../services/mockDataExtra');
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

router.get('/:name/detail', (req, res) => {
  if (config.useMockData) {
    const detail = extra.deviceDetail(req.params.name);
    if (!detail) return res.status(404).json({ error: `Device "${req.params.name}" not found.` });
    return res.json(detail);
  }
  res.status(501).json({ error: 'Live device detail not wired yet.' });
});

module.exports = router;
