// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
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
      // En Axios v1, headers existe pero puede venir en distintos formatos.
      // Lo tratamos como objeto simple para el caso común.
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
