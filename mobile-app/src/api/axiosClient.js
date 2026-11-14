import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './config';

const axiosClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic baseURL interceptor & Bearer Token injection
axiosClient.interceptors.request.use(
  async (config) => {
    config.baseURL = API_BASE_URL;
    try {
      const token = await SecureStore.getItemAsync('pcm_mobile_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Error reading token from SecureStore', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await SecureStore.deleteItemAsync('pcm_mobile_token');
        await SecureStore.deleteItemAsync('pcm_mobile_user');
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

