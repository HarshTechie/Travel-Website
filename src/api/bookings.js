import { api } from './client';

export const saveDraft = (payload) =>
  api.post('/bookings/draft', payload).then((r) => r.data.data);

export const quotePrice = (payload) =>
  api.post('/bookings/price', payload).then((r) => r.data.data);

export const confirmBooking = (id, payload) =>
  api.post(`/bookings/${id}/confirm`, payload).then((r) => r.data.data);

export const mockCharge = (amount) =>
  api.post('/bookings/payments/mock/charge', { amount }).then((r) => r.data.data);

export const myBookings = (username) =>
  api.get(`/bookings/me/${encodeURIComponent(username)}`).then((r) => r.data.data);

export const cancelBooking = (id) =>
  api.post(`/bookings/${id}/cancel`).then((r) => r.data.data);
