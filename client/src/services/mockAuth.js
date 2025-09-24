import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock Auth API functions
export const mockLogin = async () => {
  try {
    const response = await api.post('/mock-auth/login', {
      email: 'john.doe@test.com',
      password: 'password123'
    });
    const { token, user } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return { user, token };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/mock-auth/me');
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user info');
  }
};

export default api;