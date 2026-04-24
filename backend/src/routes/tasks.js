'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.tasks());
    const client = getDefaultClient();
    const raw = await client.listTasks({ limit: Number(req.query.limit) || 50 });
    res.json(raw);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
