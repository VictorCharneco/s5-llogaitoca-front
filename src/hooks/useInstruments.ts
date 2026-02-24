import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInstruments,
  INSTRUMENTS_QUERY_KEY,
  reserveInstrument,
  type ReserveInstrumentPayload,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  type CreateInstrumentPayload,
  type UpdateInstrumentPayload,
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: INSTRUMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY }),
      ]);
    },
  });
}

// ✅ Admin: Create (optimistic so it appears immediately)
export function useCreateInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, file }: { payload: CreateInstrumentPayload; file: File }) =>
      createInstrument(payload, file),

    onSuccess: async (created) => {
      // 1) Show instantly
      qc.setQueryData(INSTRUMENTS_QUERY_KEY, (prev: unknown) => {
        const list = Array.isArray(prev) ? (prev as any[]) : [];
        if (list.some((x) => x?.id === created.id)) return list;

        // Add at the end to reduce “grid jump”
        return [...list, created];
      });

      // 2) Sync with backend
      await qc.invalidateQueries({ queryKey: INSTRUMENTS_QUERY_KEY });
    },
  });
}

// ✅ Admin: Update (optimistic replace)
export function useUpdateInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      instrumentId,
      payload,
      file,
    }: {
      instrumentId: number;
      payload: UpdateInstrumentPayload;
      file?: File | null;
    }) => updateInstrument(instrumentId, payload, file),

    onSuccess: async (updated) => {
      qc.setQueryData(INSTRUMENTS_QUERY_KEY, (prev: unknown) => {
        const list = Array.isArray(prev) ? (prev as any[]) : [];
        return list.map((x) => (x?.id === updated.id ? updated : x));
      });

      await qc.invalidateQueries({ queryKey: INSTRUMENTS_QUERY_KEY });
    },
  });
}

// ✅ Admin: Delete (remove from cache; your AnimatePresence handles the exit)
export function useDeleteInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (instrumentId: number) => deleteInstrument(instrumentId),

    onSuccess: async (_res, instrumentId) => {
      qc.setQueryData(INSTRUMENTS_QUERY_KEY, (prev: unknown) => {
        const list = Array.isArray(prev) ? (prev as any[]) : [];
        return list.filter((x) => x?.id !== instrumentId);
      });

      await qc.invalidateQueries({ queryKey: INSTRUMENTS_QUERY_KEY });
    },
  });
}