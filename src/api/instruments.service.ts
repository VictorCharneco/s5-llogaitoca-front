import { api } from './axios';
import type { ApiListResponse, Instrument, MessageResponse } from '../types';

export const INSTRUMENTS_QUERY_KEY = ['instruments'] as const;

export async function getInstruments(): Promise<Instrument[]> {
  const { data } = await api.get<ApiListResponse<Instrument>>('/api/instruments');
  return data.data;
}

export type ReserveInstrumentPayload = {
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
};

export async function reserveInstrument(
  instrumentId: number,
  payload: ReserveInstrumentPayload,
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/instruments/${instrumentId}/reserve`, payload);
  return data;
}

/**
 * Convierte "demo/instruments/xxx.webp" -> "http://127.0.0.1:8000/demo/instruments/xxx.webp"
 * usando VITE_API_URL como base.
 */
export function instrumentImageUrl(path: string | null): string | null {
  if (!path) return null;
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (!base) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}