// src/api/instruments.service.ts
import { api } from './axios';
import type {
  ApiListResponse,
  ApiSingleResponse,
  Instrument,
  MessageResponse,
  InstrumentStatus,
  InstrumentType,
} from '../types';

export const INSTRUMENTS_QUERY_KEY = ['instruments'] as const;

export async function getInstruments(): Promise<Instrument[]> {
  const { data } = await api.get<ApiListResponse<Instrument>>('/api/instruments');
  return data.data;
}

export type ReserveInstrumentPayload = {
  start_date: string;
  end_date: string;
};

export async function reserveInstrument(
  instrumentId: number,
  payload: ReserveInstrumentPayload,
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    `/api/instruments/${instrumentId}/reserve`,
    payload,
  );
  return data;
}

// ─────────────────────────────────────────────
// Admin CRUD (multipart for create/update)
// ─────────────────────────────────────────────

export type CreateInstrumentPayload = {
  name: string;
  description: string;
  type: InstrumentType;
  status: InstrumentStatus;
};

export type UpdateInstrumentPayload = CreateInstrumentPayload;

function buildInstrumentFormData(
  payload: CreateInstrumentPayload | UpdateInstrumentPayload,
  file?: File | null,
) {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('description', payload.description);
  form.append('type', payload.type);
  form.append('status', payload.status);

  if (file) {
    form.append('image', file);
  }

  return form;
}

export async function createInstrument(
  payload: CreateInstrumentPayload,
  file: File,
): Promise<Instrument> {
  const form = buildInstrumentFormData(payload, file);

  const { data } = await api.post<ApiSingleResponse<Instrument>>(
    '/api/instruments',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return data.data;
}

export async function updateInstrument(
  instrumentId: number,
  payload: UpdateInstrumentPayload,
  file?: File | null,
): Promise<Instrument> {
  const form = buildInstrumentFormData(payload, file);

  // Laravel acepta PUT con multipart, pero algunos servidores lo tratan raro.
  // Para hacerlo robusto, usamos POST + _method=PUT.
  form.append('_method', 'PUT');

  const { data } = await api.post<ApiSingleResponse<Instrument>>(
    `/api/instruments/${instrumentId}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return data.data;
}

export async function deleteInstrument(instrumentId: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/api/instruments/${instrumentId}`);
  return data;
}