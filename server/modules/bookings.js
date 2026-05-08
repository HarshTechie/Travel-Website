const express = require('express');
const { Booking, Destination } = require('../models');
const { computeTripPrice, generateBookingId } = require('../utils/pricing');

const router = express.Router();

async function resolveBase(destinationName) {
  if (!destinationName) return 8000;
  const d = await Destination.findOne({ name: destinationName }).lean();
  return d?.basePricePerPerson || 8000;
}

/* Create or update a draft */
router.post('/draft', async (req, res) => {
  try {
    const payload = req.body || {};
    const { id } = payload;

    if (id) {
      const updated = await Booking.findByIdAndUpdate(
        id,
        { ...payload, updatedAt: Date.now() },
        { new: true }
      );
      return res.json({ ok: true, data: updated });
    }

    const draft = await Booking.create({
      ...payload,
      status: 'draft',
      bookingId: generateBookingId('DRF'),
    });
    res.json({ ok: true, data: draft });
  } catch (err) {
    console.error('draft error', err);
    res.status(500).json({ ok: false, error: { message: 'Draft failed' } });
  }
});

router.get('/draft/:id', async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    res.json({ ok: true, data: b });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

/* Server-side price quote (source of truth) */
router.post('/price', async (req, res) => {
  try {
    const { destinationName, travelers, startDate, endDate, addons } =
      req.body || {};
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ ok: false, error: { message: 'Dates required' } });
    }
    const basePricePerPerson = await resolveBase(destinationName);
    const count =
      typeof travelers === 'number' ? travelers : (travelers?.length || 1);
    const price = computeTripPrice({
      basePricePerPerson,
      travelers: count,
      startDate,
      endDate,
      addons,
    });
    res.json({ ok: true, data: price });
  } catch (err) {
    console.error('price error', err);
    res.status(500).json({ ok: false, error: { message: 'Quote failed' } });
  }
});

/* Confirm booking (post mock-payment) */
router.post('/:id/confirm', async (req, res) => {
  try {
    const { txnId, paymentStatus } = req.body || {};
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ ok: false, error: { message: 'Not found' } });

    const basePricePerPerson = await resolveBase(b.destinationName);
    const count = b.travelers?.length || b.travelDetails?.count || 1;
    const price = computeTripPrice({
      basePricePerPerson,
      travelers: count,
      startDate: b.travelDetails?.startDate,
      endDate: b.travelDetails?.endDate,
      addons: b.addons,
    });

    b.priceBreakdown = price;
    b.bookingId = generateBookingId('TRP');
    b.status = paymentStatus === 'success' ? 'confirmed' : 'pending_payment';
    b.payment = {
      method: 'mock',
      txnId: txnId || 'MOCK-' + Date.now(),
      paidAt: paymentStatus === 'success' ? new Date() : undefined,
      status: paymentStatus || 'pending',
    };
    b.updatedAt = Date.now();
    await b.save();
    res.json({ ok: true, data: b });
  } catch (err) {
    console.error('confirm error', err);
    res.status(500).json({ ok: false, error: { message: 'Confirm failed' } });
  }
});

router.get('/me/:username', async (req, res) => {
  try {
    const list = await Booking.find({
      username: req.params.username,
      status: { $ne: 'draft' },
    }).sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.get('/:bookingId', async (req, res) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!b) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    res.json({ ok: true, data: b });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    b.status = 'cancelled';
    b.updatedAt = Date.now();
    await b.save();
    res.json({ ok: true, data: b });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

/* Mock payment gateway */
router.post('/payments/mock/charge', (req, res) => {
  const { amount } = req.body || {};
  const success = Math.random() < 0.9;
  res.json({
    ok: true,
    data: {
      txnId: 'MOCK-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      status: success ? 'success' : 'failed',
      amount,
    },
  });
});

module.exports = router;
