// /api/cars — returns static car rental data as a plain JSON array.
// Optional query filters (city, type, minPrice, maxPrice) applied permissively.

const express = require('express');
const cars = require('../data/cars');

const router = express.Router();

router.get('/', (req, res) => {
  const { city, type, minPrice, maxPrice } = req.query;
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  const filtered = cars.filter((car) => {
    return (
      (!city || car.city.toLowerCase() === String(city).toLowerCase()) &&
      (!type || car.carType.toLowerCase() === String(type).toLowerCase()) &&
      (min == null || car.pricePerDay >= min) &&
      (max == null || car.pricePerDay <= max)
    );
  });

  res.json(filtered);
});

router.get('/:id', (req, res) => {
  const car = cars.find((c) => String(c.id) === String(req.params.id));
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

module.exports = router;
