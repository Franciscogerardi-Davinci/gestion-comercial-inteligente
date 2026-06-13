import axios from 'axios';

import { authStorage } from '../features/auth/authStorage';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

httpClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      authStorage.getToken() &&
      window.location.pathname !== '/login'
    ) {
      authStorage.clearToken();
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
