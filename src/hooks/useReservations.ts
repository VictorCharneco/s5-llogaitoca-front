// src/hooks/useReservations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MY_RESERVATIONS_QUERY_KEY,
  getMyReservations,
  returnReservation,
  deleteReservation,
} from '../api/reservations.service';

export function useMyReservations(enabled: boolean = true) {
  return useQuery({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    queryFn: getMyReservations,
    enabled,
  });
}

export function useReturnReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => returnReservation(reservationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => deleteReservation(reservationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY });
    },
  });
}