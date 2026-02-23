// src/api/reservations.service.ts
import { api } from './axios';
import type {
  ApiListResponse,
  MessageResponse,
  ReservationWithInstrument,
} from '../types';

export const MY_RESERVATIONS_QUERY_KEY = ['reservations', 'my'] as const;

export async function getMyReservations(): Promise<ReservationWithInstrument[]> {
  const { data } = await api.get<ApiListResponse<ReservationWithInstrument>>('/api/reservations/my');
  return data.data;
}

export async function returnReservation(reservationId: number): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/reservations/${reservationId}/return`);
  return data;
}

export async function deleteReservation(reservationId: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/api/reservations/${reservationId}`);
  return data;
}