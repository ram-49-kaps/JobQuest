import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Server Error:', {
        endpoint: error.config.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        method: error.config.method
      });

      // Handle validation errors for resume/profile
      if (error.config.url.includes('/auth/profile')) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data?.details || error.response.data?.message;
          return Promise.reject(new Error(errorMessage || 'Please fill in all required fields'));
        }
      }

      // Handle token expiration
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // Handle other errors
      return Promise.reject(new Error(error.response.data?.message || 'An error occurred'));
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', {
        message: 'No response received',
        request: error.request
      });
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something happened in setting up the request
      console.error('Request Setup Error:', error.message);
      return Promise.reject(new Error('Failed to make request. Please try again.'));
    }
  }
);

export default api;