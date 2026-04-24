'use strict';
/**
 * Per-user preferences: dashboard preset (network/security/custom) and
 * tile layout. Backed by Supabase when available; in dev skip-auth mode
 * we store per-process in memory so the UI can still round-trip.
 */
const express = require('express');
const { getSupabase } = require('../services/supabase');

const router = express.Router();
const memory = new Map();

const DEFAULTS = { preset: 'network', hiddenTiles: [], tileOrder: null };

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sb = getSupabase();
    if (!sb) {
      return res.json(memory.get(userId) || DEFAULTS);
    }
    const { data, error } = await sb
      .from('user_preferences')
      .select('preset, hidden_tiles, tile_order')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    res.json(
      data
        ? { preset: data.preset, hiddenTiles: data.hidden_tiles || [], tileOrder: data.tile_order }
        : DEFAULTS
    );
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const prefs = {
      preset: req.body.preset || 'network',
      hiddenTiles: Array.isArray(req.body.hiddenTiles) ? req.body.hiddenTiles : [],
      tileOrder: req.body.tileOrder || null,
    };
    const sb = getSupabase();
    if (!sb) {
      memory.set(userId, prefs);
      return res.json(prefs);
    }
    const { error } = await sb.from('user_preferences').upsert({
      user_id: userId,
      preset: prefs.preset,
      hidden_tiles: prefs.hiddenTiles,
      tile_order: prefs.tileOrder,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
