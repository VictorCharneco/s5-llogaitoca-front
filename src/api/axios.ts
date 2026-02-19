// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  // ✅ Token-based auth (Passport). No cookies needed -> avoids CORS wildcard+credentials issue
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ----------------------------------------------------
// REQUEST INTERCEPTOR - Attach Bearer token (if exists)
// ----------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      (config.headers as any) = {
        ...(config.headers as any),
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ----------------------------------------------------
// RESPONSE INTERCEPTOR - Basic pass-through
// ----------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
