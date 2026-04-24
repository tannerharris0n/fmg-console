'use strict';
/**
 * Fabric surfaces - SD-WAN, VPN, HA. Mock mode returns rich fixtures.
 * Live mode stubs return 501 until the FMG integration lands in v0.5.
 */
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const extra = require('../services/mockDataExtra');

const router = express.Router();

router.get('/sdwan', (req, res) => {
  if (config.useMockData) {
    return res.json({
      overlays: mock.sdwanOverlays(),
      avgSla: 91,
      atRisk: 1,
    });
  }
  res.status(501).json({ error: 'Live SD-WAN not wired yet.' });
});

router.get('/sdwan/:overlay', (req, res) => {
  if (config.useMockData) return res.json(extra.sdwanOverlayDetail(req.params.overlay));
  res.status(501).json({ error: 'Live SD-WAN detail not wired yet.' });
});

router.get('/vpn/ipsec', (req, res) => {
  if (config.useMockData) return res.json(extra.vpnIpsecTunnels());
  res.status(501).json({ error: 'Live IPsec not wired yet.' });
});

router.get('/vpn/ssl', (req, res) => {
  if (config.useMockData) return res.json(extra.sslVpnSessions());
  res.status(501).json({ error: 'Live SSL-VPN not wired yet.' });
});

router.get('/ha', (req, res) => {
  if (config.useMockData) return res.json(extra.haClustersDetailed());
  res.status(501).json({ error: 'Live HA detail not wired yet.' });
});

module.exports = router;
