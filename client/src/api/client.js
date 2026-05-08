import axios from 'axios';

export const API_BASE = 'https://travel-backend-qtfn.onrender.com';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err.response?.data?.error?.message ||
      err.response?.data?.error ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(msg));
  }
);

// Legacy (un-versioned) client for existing /signup, /login, /reviews, /api/favorites
export const legacy = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});
