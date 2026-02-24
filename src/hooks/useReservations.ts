// src/hooks/useReservations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MY_RESERVATIONS_QUERY_KEY,
  ALL_RESERVATIONS_QUERY_KEY,
  getMyReservations,
  getAllReservations,
  returnReservation,
  deleteReservation,
} from '../api/reservations.service';

const commonQueryOptions = {
  // Evita que al cambiar de tab/foco te deje data en undefined y “parezca vacío”
  staleTime: 30_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  // Mantener el último resultado mientras refetchea
  placeholderData: (prev: any) => prev,
} as const;

export function useMyReservations(enabled: boolean = true) {
  return useQuery({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    queryFn: getMyReservations,
    enabled,
    ...commonQueryOptions,
  });
}

export function useAllReservations(enabled: boolean = true) {
  return useQuery({
    queryKey: ALL_RESERVATIONS_QUERY_KEY,
    queryFn: getAllReservations,
    enabled,
    ...commonQueryOptions,
  });
}

export function useReturnReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => returnReservation(reservationId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: ALL_RESERVATIONS_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => deleteReservation(reservationId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: ALL_RESERVATIONS_QUERY_KEY }),
      ]);
    },
  });
}