import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only clear token on actual 401 (not 403 role-based)
      if (error.response?.status === 401) {
        localStorage.removeItem('hc_token');
        localStorage.removeItem('hc_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
