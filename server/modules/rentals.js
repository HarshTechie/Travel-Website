const express = require('express');
const mongoose = require('mongoose');
const { Car, Vendor, RentalBooking, VendorReview, User } = require('../models');
const { computeRentalPrice, generateBookingId } = require('../utils/pricing');
const { mockCars, filterMock } = require('../data/mockCars');

const router = express.Router();

/* -------- Customer: browse cars -------- */
router.get('/cars', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, from, to } = req.query;
    const q = { availability: true };
    if (city) q['location.city'] = new RegExp(`^${city}$`, 'i');
    if (type) q.type = type;
    if (minPrice || maxPrice) {
      q['pricing.perDayRate'] = {};
      if (minPrice) q['pricing.perDayRate'].$gte = Number(minPrice);
      if (maxPrice) q['pricing.perDayRate'].$lte = Number(maxPrice);
    }
    let cars = await Car.find(q).limit(100).lean();

    if (from && to) {
      const overlapping = await RentalBooking.find({
        status: { $in: ['confirmed', 'active'] },
        startDate: { $lte: new Date(to) },
        endDate: { $gte: new Date(from) },
      }).select('carId').lean();
      const busy = new Set(overlapping.map((b) => String(b.carId)));
      cars = cars.filter((c) => !busy.has(String(c._id)));
    }

    // Enrich with vendor phone + terms (single batched lookup)
    const vendorIds = [...new Set(cars.map((c) => String(c.vendorId)).filter(Boolean))];
    if (vendorIds.length) {
      const vendors = await Vendor.find({ _id: { $in: vendorIds } })
        .select('businessName phone terms rating')
        .lean();
      const vMap = new Map(vendors.map((v) => [String(v._id), v]));
      cars = cars.map((c) => {
        const v = vMap.get(String(c.vendorId));
        return v
          ? { ...c, vendorPhone: v.phone, vendorTerms: v.terms, vendorRating: v.rating }
          : c;
      });
    }

    // Fallback to bundled mock data if the DB is empty / unseeded
    if (!cars || cars.length === 0) {
      cars = filterMock(req.query);
    }

    res.json({ ok: true, data: cars });
  } catch (err) {
    console.error('cars list error', err);
    // Even on DB error, return mock data so the UI still works
    try {
      return res.json({ ok: true, data: filterMock(req.query) });
    } catch (_) {
      return res.status(500).json({ ok: false, error: { message: 'Server error' } });
    }
  }
});

router.get('/cars/:id', async (req, res) => {
  try {
    // Mock-ID path: return bundled mock car so detail view works without seeding
    if (String(req.params.id).startsWith('mock-')) {
      const car = mockCars.find((c) => c._id === req.params.id);
      if (!car) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
      const vendor = {
        businessName: car.vendorName,
        phone: car.vendorPhone,
        terms: car.vendorTerms,
        rating: car.vendorRating,
      };
      return res.json({ ok: true, data: { car, vendor } });
    }

    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    const vendor = car.vendorId ? await Vendor.findById(car.vendorId).lean() : null;
    res.json({ ok: true, data: { car, vendor } });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.post('/cars/:id/quote', async (req, res) => {
  try {
    const { from, to, estimatedKm = 0 } = req.body || {};
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    if (!from || !to)
      return res.status(400).json({ ok: false, error: { message: 'Dates required' } });
    const price = computeRentalPrice({ car, startDate: from, endDate: to, estimatedKm });
    res.json({ ok: true, data: price });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Quote failed' } });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const {
      username,
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      estimatedKm,
    } = req.body || {};
    if (!username || !carId || !startDate || !endDate)
      return res.status(400).json({ ok: false, error: { message: 'Missing fields' } });

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ ok: false, error: { message: 'Car not found' } });

    // Overlap check
    const overlap = await RentalBooking.findOne({
      carId: car._id,
      status: { $in: ['confirmed', 'active'] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });
    if (overlap)
      return res
        .status(409)
        .json({ ok: false, error: { message: 'Car unavailable for these dates' } });

    const price = computeRentalPrice({
      car,
      startDate,
      endDate,
      estimatedKm,
    });

    const booking = await RentalBooking.create({
      bookingId: generateBookingId('CAR'),
      username,
      vendorId: car.vendorId,
      carId: car._id,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      estimatedKm,
      computedPrice: price,
      status: 'confirmed',
      payment: {
        method: 'mock',
        status: 'success',
        txnId: 'MOCK-' + Date.now(),
        paidAt: new Date(),
      },
    });

    res.json({ ok: true, data: booking });
  } catch (err) {
    console.error('rental booking error', err);
    res.status(500).json({ ok: false, error: { message: 'Booking failed' } });
  }
});

router.get('/bookings/me/:username', async (req, res) => {
  try {
    const list = await RentalBooking.find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .lean();
    // attach car info
    const carIds = list.map((b) => b.carId);
    const cars = await Car.find({ _id: { $in: carIds } }).lean();
    const carMap = new Map(cars.map((c) => [String(c._id), c]));
    const out = list.map((b) => ({ ...b, car: carMap.get(String(b.carId)) || null }));
    res.json({ ok: true, data: out });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const b = await RentalBooking.findById(req.params.id);
    if (!b) return res.status(404).json({ ok: false, error: { message: 'Not found' } });
    b.status = 'cancelled';
    await b.save();
    res.json({ ok: true, data: b });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

/* -------- Vendor reviews -------- */
router.get('/vendors/:id/reviews', async (req, res) => {
  try {
    const reviews = await VendorReview.find({ vendorId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json({ ok: true, data: reviews });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Server error' } });
  }
});

router.post('/vendors/:id/reviews', async (req, res) => {
  try {
    const { username, rating, comment, images = [] } = req.body || {};
    if (!username || !rating)
      return res.status(400).json({ ok: false, error: { message: 'Missing fields' } });
    const r = await VendorReview.create({
      vendorId: req.params.id,
      username,
      rating,
      comment,
      images,
    });
    // update vendor aggregate
    const all = await VendorReview.find({ vendorId: req.params.id });
    const avg = all.reduce((s, x) => s + x.rating, 0) / all.length;
    await Vendor.findByIdAndUpdate(req.params.id, {
      rating: Math.round(avg * 10) / 10,
      ratingCount: all.length,
    });
    res.json({ ok: true, data: r });
  } catch (err) {
    res.status(500).json({ ok: false, error: { message: 'Review failed' } });
  }
});

module.exports = router;
