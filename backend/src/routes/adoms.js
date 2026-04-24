'use strict';
const express = require('express');
const config = require('../config');
const mock = require('../services/mockData');
const { getDefaultClient } = require('../services/fmgClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (config.useMockData) return res.json(mock.adoms());
    const client = getDefaultClient();
    const raw = await client.listAdoms();
    res.json(raw);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
