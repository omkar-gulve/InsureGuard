import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Claims API
export const getClaims = () => api.get('/claims/');
export const createClaim = (data) => api.post('/claims/', data);
export const clearClaims = () => api.delete('/claims/');

// ML Predictions
export const predictFraud = (data) => api.post('/predict/fraud', data);
export const predictPremium = (data) => api.post('/predict/premium', data);

export default api;
