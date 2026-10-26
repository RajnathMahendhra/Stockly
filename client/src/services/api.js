import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await api.put('/auth/preferences', preferences);
    return res.data;
  },
};

// ==========================================
// Stock Market APIs
// ==========================================
export const stockService = {
  searchStocks: async (query) => {
    const res = await api.get('/stocks/search', { params: { q: query } });
    return res.data;
  },
  getStockProfile: async (symbol) => {
    const res = await api.get(`/stocks/${symbol}`);
    return res.data;
  },
  getStockHistory: async (symbol, period = '1y') => {
    const res = await api.get(`/stocks/${symbol}/history`, { params: { period } });
    return res.data;
  },
  getStockIndicators: async (symbol, period = '6mo') => {
    const res = await api.get(`/stocks/${symbol}/indicators`, { params: { period } });
    return res.data;
  },
};

// ==========================================
// Prediction Studio APIs
// ==========================================
export const predictionService = {
  createPrediction: async (symbol, modelName = 'random_forest', horizon = 5, save = true) => {
    const res = await api.post('/predictions', {
      symbol,
      modelName,
      horizon,
      save,
    });
    return res.data;
  },
  getPredictionHistory: async (symbol) => {
    const res = await api.get('/predictions/history', { params: { symbol } });
    return res.data;
  },
  getPredictionById: async (id) => {
    const res = await api.get(`/predictions/${id}`);
    return res.data;
  },
  deletePrediction: async (id) => {
    const res = await api.delete(`/predictions/${id}`);
    return res.data;
  },
};

// ==========================================
// Watchlist APIs
// ==========================================
export const watchlistService = {
  getWatchlist: async () => {
    const res = await api.get('/watchlist');
    return res.data;
  },
  addToWatchlist: async (symbol, notes = '') => {
    const res = await api.post('/watchlist', { symbol, notes });
    return res.data;
  },
  removeFromWatchlist: async (symbol) => {
    const res = await api.delete(`/watchlist/${symbol}`);
    return res.data;
  },
};

// ==========================================
// Model Registry & Evaluation APIs
// ==========================================
export const modelService = {
  getModels: async () => {
    const res = await api.get('/models');
    return res.data;
  },
  getModelMetrics: async (modelName, symbol = 'AAPL') => {
    const res = await api.get(`/models/${modelName}/metrics`, {
      params: { symbol },
    });
    return res.data;
  },
  trainModels: async (symbol, period = '2y', testSize = 0.2, forceRetrain = true) => {
    const res = await api.post('/models/train', {
      symbol,
      period,
      testSize,
      forceRetrain,
    });
    return res.data;
  },
};

export default api;
