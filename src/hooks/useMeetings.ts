// src/hooks/useMeetings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MeetingStatus, CreateMeetingPayload } from '../types';
import {
  MEETINGS_QUERY_KEY,
  MY_MEETINGS_QUERY_KEY,
  getAllMeetings,
  getMyMeetings,
  createMeeting,
  joinMeeting,
  quitMeeting,
  deleteMeeting,
  updateMeetingStatus,
} from '../api/meetings.service';

export function useMyMeetings() {
  return useQuery({
    queryKey: MY_MEETINGS_QUERY_KEY,
    queryFn: getMyMeetings,
  });
}

export function useAllMeetings(enabled: boolean) {
  return useQuery({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: getAllMeetings,
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
    mutationFn: (meetingId: number) => joinMeeting(meetingId),
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
    mutationFn: (meetingId: number) => quitMeeting(meetingId),
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
    mutationFn: (meetingId: number) => deleteMeeting(meetingId),
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
    mutationFn: ({ meetingId, status }: { meetingId: number; status: MeetingStatus }) =>
      updateMeetingStatus(meetingId, status),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: MY_MEETINGS_QUERY_KEY }),
        qc.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY }),
      ]);
    },
  });
}