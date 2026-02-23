import { api } from './axios';
import type { ApiListResponse, Instrument, MessageResponse } from '../types';

export const INSTRUMENTS_QUERY_KEY = ['instruments'] as const;

export async function getInstruments(): Promise<Instrument[]> {
  const { data } = await api.get<ApiListResponse<Instrument>>('/api/instruments');
  return data.data;
}

export type ReserveInstrumentPayload = {
  start_date: string;
  end_date: string;
};

export async function reserveInstrument(
  instrumentId: number,
  payload: ReserveInstrumentPayload,
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/instruments/${instrumentId}/reserve`, payload);
  return data;
}