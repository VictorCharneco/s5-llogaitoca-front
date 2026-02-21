import { api } from './axios';
import type { ApiListResponse, ReservationWithInstrument } from '../types';

export const MY_RESERVATIONS_QUERY_KEY = ['reservations', 'my'] as const;

export async function getMyReservations(): Promise<ReservationWithInstrument[]> {
  const { data } = await api.get<ApiListResponse<ReservationWithInstrument>>('/api/reservations/my');
  return data.data;
}