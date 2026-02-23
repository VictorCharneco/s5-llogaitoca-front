// src/api/meetings.service.ts
import { api } from './axios';
import type {
  ApiListResponse,
  Meeting,
  MeetingStatus,
  MeetingWithRelations,
  CreateMeetingPayload,
  MeetingCreateResponse,
  MeetingUpdateStatusResponse,
  MessageResponse,
} from '../types';

export const MEETINGS_QUERY_KEY = ['meetings'] as const;
export const MY_MEETINGS_QUERY_KEY = ['meetings', 'my'] as const;

export async function getAllMeetings(): Promise<MeetingWithRelations[]> {
  const { data } = await api.get<ApiListResponse<MeetingWithRelations>>('/api/meetings');
  return data.data;
}

export async function getMyMeetings(): Promise<MeetingWithRelations[]> {
  const { data } = await api.get<ApiListResponse<MeetingWithRelations>>('/api/meetings/my');
  return data.data;
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<MeetingWithRelations> {
  const { data } = await api.post<MeetingCreateResponse>('/api/meetings', payload);
  return data.data;
}

export async function joinMeeting(meetingId: number): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/meetings/${meetingId}/join`);
  return data;
}

export async function quitMeeting(meetingId: number): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/meetings/${meetingId}/quit`);
  return data;
}

export async function deleteMeeting(meetingId: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/api/meetings/${meetingId}`);
  return data;
}

export async function updateMeetingStatus(
  meetingId: number,
  status: MeetingStatus,
): Promise<Meeting> {
  const { data } = await api.patch<MeetingUpdateStatusResponse>(`/api/meetings/${meetingId}/status`, {
    status,
  });
  return data.data;
}