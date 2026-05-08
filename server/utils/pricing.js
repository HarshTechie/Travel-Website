const HOTEL_MULT = { budget: 1, '3star': 1.3, '4star': 1.7, '5star': 2.5 };
const MEALS_FLAT = { none: 0, breakfast: 500, 'full-board': 1500 };
const TRANSPORT_FLAT = { none: 0, car: 1800, luxury: 4500 };
const GUIDE_FLAT = 2000;

function daysBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

function computeTripPrice({
  basePricePerPerson = 8000,
  travelers = 1,
  startDate,
  endDate,
  addons = {},
}) {
  const days = daysBetween(startDate, endDate);
  const hotel = addons.hotel || '3star';
  const meals = addons.meals || 'breakfast';
  const transport = addons.transport || 'none';
  const guide = !!addons.guide;

  const base = basePricePerPerson * travelers * days;
  const hotelCharge = base * (HOTEL_MULT[hotel] - 1);
  const mealsCharge = MEALS_FLAT[meals] * travelers * days;
  const guideCharge = guide ? GUIDE_FLAT * days : 0;
  const transportCharge = TRANSPORT_FLAT[transport] * days;

  const subtotal =
    base + hotelCharge + mealsCharge + guideCharge + transportCharge;
  const gst = Math.round(subtotal * 0.05);
  const discount = subtotal > 50000 ? Math.round(subtotal * 0.07) : 0;
  const total = Math.round(subtotal + gst - discount);

  return {
    base: Math.round(base),
    hotelCharge: Math.round(hotelCharge),
    meals: Math.round(mealsCharge),
    guide: Math.round(guideCharge),
    transport: Math.round(transportCharge),
    subtotal: Math.round(subtotal),
    gst,
    discount,
    total,
    days,
  };
}

function computeRentalPrice({ car, startDate, endDate, estimatedKm = 0 }) {
  const days = daysBetween(startDate, endDate);
  const p = car.pricing || {};
  let base = 0;
  if (p.mode === 'per_km') {
    base = (estimatedKm || 0) * (p.perKmRate || 0) + (p.baseFee || 0);
  } else {
    base = days * (p.perDayRate || 0) + (p.baseFee || 0);
  }
  const insurance = p.insurance || 0;
  const deposit = p.deposit || 0;
  const gst = Math.round((base + insurance) * 0.05);
  const total = Math.round(base + insurance + gst);
  return {
    base: Math.round(base),
    insurance,
    deposit,
    gst,
    total,
    days,
  };
}

function generateBookingId(prefix = 'TRP') {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yy}${mm}${dd}-${rand}`;
}

module.exports = { computeTripPrice, computeRentalPrice, generateBookingId };
