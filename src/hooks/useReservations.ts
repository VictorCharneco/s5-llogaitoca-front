import { useQuery } from '@tanstack/react-query';
import { getMyReservations, MY_RESERVATIONS_QUERY_KEY } from '../api/reservations.service';

export function useMyReservations() {
  return useQuery({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    queryFn: getMyReservations,
  });
}