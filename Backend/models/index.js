const mongoose = require('mongoose');

/*
 * NOTE: User / Favorite / Review are registered by the legacy `index.js`
 * with the extended (additive) fields. We reference them here without
 * re-registering to avoid OverwriteModelError.
 */

/* ---------------- New collections ---------------- */

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  category: {
    type: String,
    enum: ['Popular', 'Culture', 'Beach', 'Adventure', 'Mountain'],
    default: 'Popular',
  },
  country: { type: String, default: 'India' },
  city: String,
  lat: Number,
  lng: Number,
  images: [String],
  description: String,
  basePricePerPerson: { type: Number, default: 8000 },
  popularity: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const travelerSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    idType: { type: String, enum: ['aadhaar', 'passport', 'pan', 'dl'] },
    idNumber: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, index: true },
  username: { type: String, index: true },
  destinationName: String,
  destinationImage: String,
  travelers: [travelerSubSchema],
  travelDetails: {
    startDate: Date,
    endDate: Date,
    packageType: {
      type: String,
      enum: ['standard', 'premium', 'luxury'],
      default: 'standard',
    },
    count: { type: Number, default: 1 },
  },
  contact: {
    email: String,
    phone: String,
  },
  addons: {
    hotel: {
      type: String,
      enum: ['budget', '3star', '4star', '5star'],
      default: '3star',
    },
    meals: {
      type: String,
      enum: ['none', 'breakfast', 'full-board'],
      default: 'breakfast',
    },
    guide: { type: Boolean, default: false },
    transport: {
      type: String,
      enum: ['none', 'car', 'luxury'],
      default: 'none',
    },
  },
  priceBreakdown: {
    base: Number,
    hotelCharge: Number,
    meals: Number,
    guide: Number,
    transport: Number,
    subtotal: Number,
    gst: Number,
    discount: Number,
    total: Number,
  },
  status: {
    type: String,
    enum: [
      'draft',
      'pending_payment',
      'confirmed',
      'cancelled',
      'completed',
    ],
    default: 'draft',
    index: true,
  },
  payment: {
    method: { type: String, default: 'mock' },
    txnId: String,
    paidAt: Date,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const vendorSchema = new mongoose.Schema({
  username: { type: String, unique: true, index: true },
  businessName: { type: String, required: true },
  phone: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  location: {
    city: String,
    state: String,
    lat: Number,
    lng: Number,
  },
  kyc: {
    pan: String,
    gstin: String,
    verified: { type: Boolean, default: false },
  },
  terms: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const carSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    index: true,
  },
  vendorName: String,
  make: String,
  model: String,
  year: Number,
  type: {
    type: String,
    enum: ['SUV', 'Sedan', 'Hatchback', 'Luxury'],
    default: 'Sedan',
    index: true,
  },
  fuel: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
  seats: { type: Number, default: 5 },
  transmission: { type: String, enum: ['manual', 'automatic'] },
  images: [String],
  pricing: {
    mode: { type: String, enum: ['per_km', 'per_day'], default: 'per_day' },
    perKmRate: Number,
    perDayRate: Number,
    baseFee: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
  },
  location: {
    city: { type: String, index: true },
    lat: Number,
    lng: Number,
  },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const rentalBookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, index: true },
  username: { type: String, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', index: true },
  startDate: { type: Date, index: true },
  endDate: { type: Date, index: true },
  pickupLocation: String,
  dropLocation: String,
  estimatedKm: { type: Number, default: 0 },
  computedPrice: {
    base: Number,
    insurance: Number,
    deposit: Number,
    gst: Number,
    total: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  payment: {
    method: { type: String, default: 'mock' },
    txnId: String,
    paidAt: Date,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const vendorReviewSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    index: true,
  },
  username: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  images: [String],
  vendorReply: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const itinerarySchema = new mongoose.Schema({
  username: { type: String, index: true },
  destinationName: String,
  days: Number,
  startDate: Date,
  endDate: Date,
  budget: Number,
  travelStyle: {
    type: String,
    enum: ['backpacking', 'standard', 'luxury'],
    default: 'standard',
  },
  content: { type: mongoose.Schema.Types.Mixed, default: [] },
  shareSlug: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

/* ---------------- Model registration (idempotent) ---------------- */

const model = (name, schema) =>
  mongoose.models[name] || mongoose.model(name, schema);

// Lazy getter so legacy registrations (in Backend/index.js) win without
// racing on require order.
const lazy = (name) => () => mongoose.models[name];

module.exports = {
  get User()     { return mongoose.models.User; },
  get Favorite() { return mongoose.models.Favorite; },
  get Review()   { return mongoose.models.Review; },
  Destination:   model('Destination', destinationSchema),
  Booking:       model('Booking', bookingSchema),
  Vendor:        model('Vendor', vendorSchema),
  Car:           model('Car', carSchema),
  RentalBooking: model('RentalBooking', rentalBookingSchema),
  VendorReview:  model('VendorReview', vendorReviewSchema),
  Itinerary:     model('Itinerary', itinerarySchema),
};

