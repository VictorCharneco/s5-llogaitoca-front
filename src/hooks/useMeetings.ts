import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateMeetingPayload, MeetingStatus } from '../types';
import {
  MEETINGS_QUERY_KEY,
  MY_MEETINGS_QUERY_KEY,
  getMeetings,
  getMyMeetings,
  createMeeting,
  deleteMeeting,
  joinMeeting,
  quitMeeting,
  updateMeetingStatus,
} from '../api/meetings.service';

export function useMyMeetings() {
  return useQuery({
    queryKey: MY_MEETINGS_QUERY_KEY,
    queryFn: getMyMeetings,
  });
}

export function useAllMeetings(enabled = false) {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: getMeetings,
    enabled,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) => createMeeting(payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}

export function useJoinMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => joinMeeting(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}

export function useQuitMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => quitMeeting(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMeeting(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}

export function useUpdateMeetingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: MeetingStatus }) =>
      updateMeetingStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}