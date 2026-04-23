const express = require('express');
const { Destination } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, sort, trending, q } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (trending === 'true') filter.trending = true;
    if (q) filter.name = new RegExp(q, 'i');

    let query = Destination.find(filter);
    if (sort === 'price') query = query.sort({ basePricePerPerson: 1 });
    else if (sort === 'popularity') query = query.sort({ popularity: -1 });
    else query = query.sort({ createdAt: -1 });

    const data = await query.lean();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const seedData = req.body?.destinations || [];
    if (!Array.isArray(seedData) || !seedData.length)
      return res.status(400).json({ ok: false, error: { message: 'No data' } });
    await Destination.deleteMany({});
    const out = await Destination.insertMany(seedData);
    res.json({ ok: true, data: { count: out.length } });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Seed failed' } });
  }
});

module.exports = router;
