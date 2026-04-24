'use strict';
/**
 * Install preview - the "diff before push" endpoint. Given a policy package,
 * returns the set of changes that would be pushed to each target device.
 *
 * In mock mode we return a realistic fixture. Live mode will need to call
 * `exec /securityconsole/install/preview` and parse the task result, which
 * is a v0.3 integration.
 */
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');

const router = express.Router();

router.get('/:packageId/preview', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.installPreview(req.params.packageId));
    // Live mode stub - structure matches what we'll return once wired to FMG.
    res.status(501).json({ error: 'Live install preview not wired yet. Set USE_MOCK_DATA=true for now.' });
  } catch (err) {
    next(err);
  }
});

router.post('/:packageId/execute', async (req, res, next) => {
  try {
    if (config.useMockData) {
      // Simulate queuing a task.
      return res.json({ ok: true, taskId: Math.floor(1100 + Math.random() * 100) });
    }
    res.status(501).json({ error: 'Live install execution not wired yet.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
