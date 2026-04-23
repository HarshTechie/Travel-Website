const express = require('express');
const { Review } = require('../models');

const router = express.Router();

/* List all reviews (extended with rating/images) */
router.get('/', async (req, res) => {
  try {
    const { destination_name } = req.query;
    const q = destination_name ? { destination_name } : {};
    const reviews = await Review.find(q).sort({ created_at: -1 });
    res.json({ ok: true, data: reviews });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

/* Enhanced review with rating + images */
router.post('/', async (req, res) => {
  try {
    const { username, review, destination_name, rating, images = [] } = req.body || {};
    if (!username || !review)
      return res.status(400).json({ ok: false, error: { message: 'Username and review required' } });
    const r = await Review.create({ username, review, destination_name, rating, images });
    res.json({ ok: true, data: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Save failed' } });
  }
});

module.exports = router;
