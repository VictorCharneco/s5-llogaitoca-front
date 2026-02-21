import { api } from './axios';
import type {
  ApiListResponse,
  MeetingWithRelations,
  MeetingCreateResponse,
  MeetingUpdateStatusResponse,
  MessageResponse,
  CreateMeetingPayload,
  MeetingStatus,
} from '../types';

export const MEETINGS_QUERY_KEY = ['meetings'] as const;
export const MY_MEETINGS_QUERY_KEY = ['meetings', 'my'] as const;

export async function getMeetings(): Promise<MeetingWithRelations[]> {
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

export async function deleteMeeting(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/api/meetings/${id}`);
  return data;
}

export async function joinMeeting(id: number): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/meetings/${id}/join`);
  return data;
}

export async function quitMeeting(id: number): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(`/api/meetings/${id}/quit`);
  return data;
}

export async function updateMeetingStatus(
  id: number,
  status: MeetingStatus,
): Promise<MeetingUpdateStatusResponse> {
  const { data } = await api.patch<MeetingUpdateStatusResponse>(`/api/meetings/${id}/status`, { status });
  return data;
}