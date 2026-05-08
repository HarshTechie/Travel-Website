/*
 * One-shot seed script for new collections.
 * Run:  node Backend/seed.js
 * Safe: does NOT touch Users, Favorites, or legacy Reviews.
 */
const mongoose = require('mongoose');
const { Vendor, Car, Destination } = require('./models');

const DESTINATIONS = [
  { name: 'Jaipur',    category: 'Popular',   basePricePerPerson: 8500,  popularity: 95, trending: true,  city: 'Jaipur',    lat: 26.9124, lng: 75.7873 },
  { name: 'Goa',       category: 'Beach',     basePricePerPerson: 10500, popularity: 98, trending: true,  city: 'Panaji',    lat: 15.4909, lng: 73.8278 },
  { name: 'Agra',      category: 'Culture',   basePricePerPerson: 7200,  popularity: 88, trending: false, city: 'Agra',      lat: 27.1767, lng: 78.0081 },
  { name: 'Udaipur',   category: 'Popular',   basePricePerPerson: 9800,  popularity: 90, trending: true,  city: 'Udaipur',   lat: 24.5854, lng: 73.7125 },
  { name: 'Darjeeling',category: 'Mountain',  basePricePerPerson: 8200,  popularity: 80, trending: false, city: 'Darjeeling',lat: 27.0360, lng: 88.2627 },
  { name: 'Varanasi',  category: 'Culture',   basePricePerPerson: 6500,  popularity: 78, trending: false, city: 'Varanasi',  lat: 25.3176, lng: 82.9739 },
  { name: 'Mysore',    category: 'Culture',   basePricePerPerson: 7600,  popularity: 76, trending: false, city: 'Mysore',    lat: 12.2958, lng: 76.6394 },
  { name: 'Ladakh',    category: 'Adventure', basePricePerPerson: 14500, popularity: 92, trending: true,  city: 'Leh',       lat: 34.1526, lng: 77.5770 },
];

const VENDORS = [
  { username: 'vendor_a', businessName: 'CityWheels Rentals',  city: 'Bengaluru', state: 'Karnataka',
    phone: '+91 98450 11122',
    terms: 'Minimum 18y license. Fuel excluded. 50km/day free.' },
  { username: 'vendor_b', businessName: 'Goa Drive Partners',  city: 'Panaji',    state: 'Goa',
    phone: '+91 90040 33221',
    terms: 'Extra ₹10/km beyond 200km/day. Security deposit refundable in 48h.' },
  { username: 'vendor_c', businessName: 'Royal Wheels Jaipur', city: 'Jaipur',    state: 'Rajasthan',
    phone: '+91 93511 77889',
    terms: 'Local sightseeing only. Outstation trips need prior approval.' },
];

async function run() {
  await mongoose.connect('mongodb://localhost:27017/travelDB');
  console.log('Connected.');

  // Destinations
  for (const d of DESTINATIONS) {
    await Destination.updateOne(
      { name: d.name },
      { $set: d },
      { upsert: true }
    );
  }
  console.log(`Seeded ${DESTINATIONS.length} destinations.`);

  // Vendors
  const vendorDocs = [];
  for (const v of VENDORS) {
    const doc = await Vendor.findOneAndUpdate(
      { username: v.username },
      {
        $set: {
          businessName: v.businessName,
          phone: v.phone,
          location: { city: v.city, state: v.state },
          terms: v.terms,
        },
      },
      { upsert: true, new: true }
    );
    vendorDocs.push(doc);
  }
  console.log(`Seeded ${vendorDocs.length} vendors.`);

  // Cars
  await Car.deleteMany({});
  const CARS = [
    { vendor: 0, make: 'Maruti', model: 'Swift',  year: 2022, type: 'Hatchback', fuel: 'petrol',
      seats: 5, transmission: 'manual',    perDay: 1800, perKm: 10, city: 'Bengaluru',
      img: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=600' },
    { vendor: 0, make: 'Honda',  model: 'City',   year: 2023, type: 'Sedan',     fuel: 'petrol',
      seats: 5, transmission: 'automatic', perDay: 2800, perKm: 14, city: 'Bengaluru',
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600' },
    { vendor: 1, make: 'Toyota', model: 'Innova', year: 2023, type: 'SUV',       fuel: 'diesel',
      seats: 7, transmission: 'manual',    perDay: 3500, perKm: 16, city: 'Panaji',
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600' },
    { vendor: 1, make: 'Mahindra', model: 'Thar', year: 2024, type: 'SUV',       fuel: 'diesel',
      seats: 4, transmission: 'manual',    perDay: 4200, perKm: 18, city: 'Panaji',
      img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600' },
    { vendor: 2, make: 'BMW',    model: '5 Series', year: 2023, type: 'Luxury',  fuel: 'petrol',
      seats: 5, transmission: 'automatic', perDay: 12000, perKm: 40, city: 'Jaipur',
      img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600' },
    { vendor: 2, make: 'Hyundai', model: 'Creta', year: 2023, type: 'SUV',       fuel: 'petrol',
      seats: 5, transmission: 'automatic', perDay: 3200, perKm: 15, city: 'Jaipur',
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600' },
  ];

  for (const c of CARS) {
    await Car.create({
      vendorId: vendorDocs[c.vendor]._id,
      vendorName: vendorDocs[c.vendor].businessName,
      make: c.make, model: c.model, year: c.year, type: c.type,
      fuel: c.fuel, seats: c.seats, transmission: c.transmission,
      images: [c.img],
      pricing: { mode: 'per_day', perDayRate: c.perDay, perKmRate: c.perKm, baseFee: 0, insurance: 300, deposit: 2000 },
      location: { city: c.city },
      availability: true,
    });
  }
  console.log(`Seeded ${CARS.length} cars.`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
