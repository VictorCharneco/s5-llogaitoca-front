// ─────────────────────────────────────────────
//  ENUMS
// ─────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export type InstrumentType = 'STRING' | 'WIND' | 'PERCUSSION' | 'KEYBOARD';

export type InstrumentStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'MAINTENANCE';

export type ReservationStatus = 'ACTIVE' | 'FINISHED';

export type MeetingRoom = 'SPRINGSTEEN' | 'DYLAN' | 'ARMSTRONG' | 'MARTIN';

export type MeetingStatus = 'ACTIVE' | 'FINISHED' | 'CANCELLED';

// ─────────────────────────────────────────────
//  CORE ENTITIES
// ─────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Instrument {
  id: number;
  name: string;
  description: string;
  type: InstrumentType;
  status: InstrumentStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  instrument_id: number;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithInstrument extends Reservation {
  instrument: Instrument;
}

export interface Meeting {
  id: number;
  reservation_id: number;
  room: MeetingRoom;
  day: string;        // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  status: MeetingStatus;
  users_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingWithRelations extends Meeting {
  users_count: number;
  reservation: Reservation;
  users: User[];
}

// ─────────────────────────────────────────────
//  API REQUEST PAYLOADS
// ─────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateInstrumentPayload {
  name: string;
  description: string;
  type: InstrumentType;
  status: InstrumentStatus;
  image_url?: string | null;
}

export interface UpdateInstrumentPayload extends Partial<CreateInstrumentPayload> {}

export interface CreateReservationPayload {
  instrument_id: number;
  start_date: string;
  end_date: string;
}

export interface CreateMeetingPayload {
  reservation_id: number;
  room: MeetingRoom;
  day: string;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface UpdateMeetingStatusPayload {
  status: MeetingStatus;
}

// ─────────────────────────────────────────────
//  API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface MeetingCreateResponse {
  message: string;
  data: MeetingWithRelations;
}

export interface MeetingUpdateStatusResponse {
  message: string;
  data: Meeting;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ErrorResponse {
  message: string;
}