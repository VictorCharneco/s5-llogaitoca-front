// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      // ✅ NO reasignes config.headers: añade la cabecera
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
      (config.headers as any).Accept = 'application/json';
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);