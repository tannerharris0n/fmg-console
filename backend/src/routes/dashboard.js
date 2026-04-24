'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const extra = require('../services/mockDataExtra');
const { getDefaultClient } = require('../services/fmgClient');
const logger = require('../logger');

const router = express.Router();

router.get('/at-risk', (req, res) => {
  if (config.useMockData) return res.json(extra.atRisk());
  res.status(501).json({ error: 'Live at-risk aggregation not wired yet.' });
});

/**
 * GET /api/dashboard
 * Returns every tile's data in one round-trip so the dashboard renders in
 * a single fetch. Individual routes (devices, sdwan, etc.) are still
 * available for drill-downs.
 */
router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) {
      return res.json({
        summary: mock.dashboardSummary(),
        atRisk: extra.atRisk(),
        sdwan: mock.sdwanOverlays(),
        vpn: mock.vpnTunnels(),
        ha: mock.haClusters(),
        firmware: mock.firmwarePosture(),
        fleet: mock.deviceFleet(),
        heatmap: mock.policyHeatmap(),
        threats: mock.threatActivity(),
        cves: mock.cveWatchlist(),
        drift: mock.driftAlerts(),
        audit: mock.adminAudit(),
        activity: mock.activityFeed(),
      });
    }

    // Live mode. For v0.1 we only populate what's directly available from
    // FMG - threat/CVE/drift come from adjacent systems and fall back to
    // mocks until those integrations land in v0.2.
    const client = getDefaultClient();
    const [devicesRaw, tasks, adoms] = await Promise.all([
      client.listDevices().catch((e) => { logger.warn({ err: e.message }, 'fmg devices failed'); return []; }),
      client.listTasks().catch(() => []),
      client.listAdoms().catch(() => []),
    ]);

    const fleet = devicesRaw.map((d) => ({
      name: d.name,
      platform: d.platform_str,
      firmware: `${d.os_ver}.${d.mr}.${d.patch}`,
      status: d.conn_status === 0 ? 'offline' : 'ok',
      note: d.conn_status === 0 ? 'offline' : null,
    }));

    const activeTasks = tasks.filter((t) => (t.percent || 0) < 100).length;

    res.json({
      summary: {
        devices: {
          total: devicesRaw.length,
          online: devicesRaw.filter((d) => d.conn_status === 1).length,
          offline: devicesRaw.filter((d) => d.conn_status === 0).length,
        },
        installs: { pending: activeTasks, running: activeTasks, runningPct: 0 },
        drift: { count: 0, severity: 'ok' },
        tasks: { active: activeTasks },
        adoms: adoms.length,
        updatedAt: new Date().toISOString(),
      },
      atRisk: extra.atRisk(),
      sdwan: mock.sdwanOverlays(),
      vpn: mock.vpnTunnels(),
      ha: mock.haClusters(),
      firmware: mock.firmwarePosture(),
      fleet,
      heatmap: mock.policyHeatmap(),
      threats: mock.threatActivity(),
      cves: mock.cveWatchlist(),
      drift: mock.driftAlerts(),
      audit: mock.adminAudit(),
      activity: mock.activityFeed(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
