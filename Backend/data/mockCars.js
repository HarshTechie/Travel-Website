// Mock rental listings returned by /api/v1/rentals/cars when the DB is empty.
// Shape matches what the frontend already expects (Car + enriched vendor fields).
// Keep additive — do not alter existing schemas.

const mockCars = [
  {
    _id: 'mock-1',
    make: 'Maruti', model: 'Swift', year: 2022,
    type: 'Hatchback', fuel: 'petrol', seats: 5, transmission: 'manual',
    images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=600'],
    pricing: { mode: 'per_day', perDayRate: 1800, perKmRate: 10, insurance: 300, deposit: 2000 },
    location: { city: 'Bengaluru' },
    vendorName: 'CityWheels Rentals',
    vendorPhone: '+91 98450 11122',
    vendorTerms: 'Minimum 18y license. Fuel excluded. 50km/day free.',
    vendorRating: 4.4,
    availability: true,
  },
  {
    _id: 'mock-2',
    make: 'Honda', model: 'City', year: 2023,
    type: 'Sedan', fuel: 'petrol', seats: 5, transmission: 'automatic',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'],
    pricing: { mode: 'per_day', perDayRate: 2800, perKmRate: 14, insurance: 300, deposit: 2000 },
    location: { city: 'Bengaluru' },
    vendorName: 'CityWheels Rentals',
    vendorPhone: '+91 98450 11122',
    vendorTerms: 'Minimum 18y license. Fuel excluded. 50km/day free.',
    vendorRating: 4.4,
    availability: true,
  },
  {
    _id: 'mock-3',
    make: 'Toyota', model: 'Innova', year: 2023,
    type: 'SUV', fuel: 'diesel', seats: 7, transmission: 'manual',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600'],
    pricing: { mode: 'per_day', perDayRate: 3500, perKmRate: 16, insurance: 300, deposit: 2500 },
    location: { city: 'Panaji' },
    vendorName: 'Goa Drive Partners',
    vendorPhone: '+91 90040 33221',
    vendorTerms: 'Extra ₹10/km beyond 200km/day. Deposit refundable in 48h.',
    vendorRating: 4.6,
    availability: true,
  },
  {
    _id: 'mock-4',
    make: 'Mahindra', model: 'Thar', year: 2024,
    type: 'SUV', fuel: 'diesel', seats: 4, transmission: 'manual',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'],
    pricing: { mode: 'per_day', perDayRate: 4200, perKmRate: 18, insurance: 400, deposit: 3000 },
    location: { city: 'Panaji' },
    vendorName: 'Goa Drive Partners',
    vendorPhone: '+91 90040 33221',
    vendorTerms: 'Extra ₹10/km beyond 200km/day. Deposit refundable in 48h.',
    vendorRating: 4.6,
    availability: true,
  },
  {
    _id: 'mock-5',
    make: 'BMW', model: '5 Series', year: 2023,
    type: 'Luxury', fuel: 'petrol', seats: 5, transmission: 'automatic',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600'],
    pricing: { mode: 'per_day', perDayRate: 12000, perKmRate: 40, insurance: 1200, deposit: 10000 },
    location: { city: 'Jaipur' },
    vendorName: 'Royal Wheels Jaipur',
    vendorPhone: '+91 93511 77889',
    vendorTerms: 'Local sightseeing only. Outstation needs prior approval.',
    vendorRating: 4.8,
    availability: true,
  },
  {
    _id: 'mock-6',
    make: 'Hyundai', model: 'Creta', year: 2023,
    type: 'SUV', fuel: 'petrol', seats: 5, transmission: 'automatic',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'],
    pricing: { mode: 'per_day', perDayRate: 3200, perKmRate: 15, insurance: 350, deposit: 2500 },
    location: { city: 'Jaipur' },
    vendorName: 'Royal Wheels Jaipur',
    vendorPhone: '+91 93511 77889',
    vendorTerms: 'Local sightseeing only. Outstation needs prior approval.',
    vendorRating: 4.8,
    availability: true,
  },
  {
    _id: 'mock-7',
    make: 'Tata', model: 'Nexon EV', year: 2024,
    type: 'SUV', fuel: 'electric', seats: 5, transmission: 'automatic',
    images: ['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600'],
    pricing: { mode: 'per_day', perDayRate: 2600, perKmRate: 8, insurance: 250, deposit: 2000 },
    location: { city: 'Mumbai' },
    vendorName: 'EcoDrive Mumbai',
    vendorPhone: '+91 99200 44556',
    vendorTerms: 'Home charging guide provided. Range: 300km per charge.',
    vendorRating: 4.5,
    availability: true,
  },
  {
    _id: 'mock-8',
    make: 'Volkswagen', model: 'Polo', year: 2022,
    type: 'Hatchback', fuel: 'petrol', seats: 5, transmission: 'manual',
    images: ['https://images.unsplash.com/photo-1541348263662-e068662d82af?w=600'],
    pricing: { mode: 'per_day', perDayRate: 1600, perKmRate: 9, insurance: 250, deposit: 1500 },
    location: { city: 'Mumbai' },
    vendorName: 'EcoDrive Mumbai',
    vendorPhone: '+91 99200 44556',
    vendorTerms: 'Free cancellation up to 24h before pickup.',
    vendorRating: 4.5,
    availability: true,
  },
];

// Simple in-memory filter so /cars query params still work with mock data.
const filterMock = (q = {}) => {
  return mockCars.filter((c) => {
    if (q.city && !(c.location?.city || '').toLowerCase().includes(String(q.city).toLowerCase())) return false;
    if (q.type && c.type !== q.type) return false;
    const rate = c.pricing?.perDayRate || 0;
    if (q.minPrice && rate < Number(q.minPrice)) return false;
    if (q.maxPrice && rate > Number(q.maxPrice)) return false;
    return true;
  });
};

module.exports = { mockCars, filterMock };
