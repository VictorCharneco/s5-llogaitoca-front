import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInstruments,
  INSTRUMENTS_QUERY_KEY,
  reserveInstrument,
  type ReserveInstrumentPayload,
} from '../api/instruments.service';
import { MY_RESERVATIONS_QUERY_KEY } from '../api/reservations.service';

export function useInstruments() {
  return useQuery({
    queryKey: INSTRUMENTS_QUERY_KEY,
    queryFn: getInstruments,
  });
}

export function useReserveInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ instrumentId, payload }: { instrumentId: number; payload: ReserveInstrumentPayload }) =>
      reserveInstrument(instrumentId, payload),
    onSuccess: async () => {
      // refresca el catálogo (status cambia) y la lista de "mis reservas"
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: INSTRUMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY }),
      ]);
    },
  });
}