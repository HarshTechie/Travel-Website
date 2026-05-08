import axios from 'axios';
import { API_BASE } from './client';

const carsApi = axios.create({
  baseURL: `${API_BASE}/api/cars`,
  timeout: 15000,
});

export const listCars = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  return carsApi.get('/', { params: clean }).then((r) => {
    // API returns a plain array: res.json(cars)
    console.log('[cars] API response:', r.data);
    return Array.isArray(r.data) ? r.data : [];
  });
};

export const getCar = (id) =>
  carsApi.get(`/${id}`).then((r) => r.data);
