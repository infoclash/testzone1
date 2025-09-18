// config/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token present:', !!token);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ✅`);
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    console.error('❌ API Response error:', {
      status: response?.status,
      statusText: response?.statusText,
      message: response?.data?.message || error.message,
      url: config?.url,
      method: config?.method?.toUpperCase()
    });
    
    // Handle authentication errors
    if (response?.status === 401) {
      console.log('🔐 Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Handle 404 errors
    if (response?.status === 404) {
      console.log('🔍 Resource not found:', config?.url);
    }
    
    // Handle rate limiting
    if (response?.status === 429) {
      console.log('⏳ Rate limited - please wait before trying again');
    }
    
    return Promise.reject(error);
  }
);

export default api;