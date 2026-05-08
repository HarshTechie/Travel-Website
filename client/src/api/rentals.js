import { api } from './client';

export const listCars = (params = {}) =>
  api.get('/rentals/cars', { params }).then((r) => r.data.data);

export const getCar = (id) =>
  api.get(`/rentals/cars/${id}`).then((r) => r.data.data);

export const quoteCar = (id, payload) =>
  api.post(`/rentals/cars/${id}/quote`, payload).then((r) => r.data.data);

export const bookCar = (payload) =>
  api.post('/rentals/bookings', payload).then((r) => r.data.data);

export const myRentals = (username) =>
  api.get(`/rentals/bookings/me/${encodeURIComponent(username)}`).then((r) => r.data.data);

export const cancelRental = (id) =>
  api.post(`/rentals/bookings/${id}/cancel`).then((r) => r.data.data);

export const listVendorReviews = (vendorId) =>
  api.get(`/rentals/vendors/${vendorId}/reviews`).then((r) => r.data.data);

export const addVendorReview = (vendorId, payload) =>
  api.post(`/rentals/vendors/${vendorId}/reviews`, payload).then((r) => r.data.data);
