import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pcm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and unauthenticated 401
axiosClient.interceptors.response.use(
  (response) => {
    // Return API payload directly
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('pcm_token');
        localStorage.removeItem('pcm_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

