import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CalendarDays, AlertTriangle, Plus } from 'lucide-react';

import type { MeetingRoom, CreateMeetingPayload, ReservationWithInstrument } from '../types';

type Props = {
  isOpen: boolean;
  defaultDay: string | null;   // YYYY-MM-DD
  defaultStart: string | null; // HH:MM (optional)
  defaultEnd: string | null;   // HH:MM (optional)

  reservations: ReservationWithInstrument[];
  isSubmitting?: boolean;
  errorMessage?: string | null;

  onClose: () => void;
  onConfirmCreate: (payload: CreateMeetingPayload) => void;
};

const ROOMS: MeetingRoom[] = ['SPRINGSTEEN', 'DYLAN', 'ARMSTRONG', 'MARTIN'];

function hhmmOrDefault(v: string | null, fallback: string) {
  if (!v) return fallback;
  return v.slice(0, 5);
}

export default function CalendarMeetingModal({
  isOpen,
  defaultDay,
  defaultStart,
  defaultEnd,
  reservations,
  isSubmitting = false,
  errorMessage,
  onClose,
  onConfirmCreate,
}: Props) {
  const root = document.getElementById('root');
  if (!root) return null;

  const activeReservations = useMemo(
    () => reservations.filter((r) => r.status === 'ACTIVE'),
    [reservations],
  );

  const [reservationId, setReservationId] = useState<number>(0);
  const [room, setRoom] = useState<MeetingRoom>('SPRINGSTEEN');
  const [day, setDay] = useState<string>('');
  const [start, setStart] = useState<string>('18:00');
  const [end, setEnd] = useState<string>('19:00');
  const [localError, setLocalError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    setLocalError('');
    setDay(defaultDay ?? '');
    setStart(hhmmOrDefault(defaultStart, '18:00'));
    setEnd(hhmmOrDefault(defaultEnd, '19:00'));

    // preselect first active reservation
    const first = activeReservations[0]?.id ?? 0;
    setReservationId(first);
    setRoom('SPRINGSTEEN');
  }, [isOpen, defaultDay, defaultStart, defaultEnd, activeReservations]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!reservationId) {
      setLocalError('Select an active reservation (instrument) first.');
      return;
    }
    if (!day) {
      setLocalError('Select a day.');
      return;
    }
    if (!start || !end) {
      setLocalError('Start and end time are required.');
      return;
    }
    if (end <= start) {
      setLocalError('End time must be after start time.');
      return;
    }

    const payload: CreateMeetingPayload = {
      reservation_id: reservationId,
      room,
      day,
      start_time: start,
      end_time: end,
    };

    onConfirmCreate(payload);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 80,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              padding: 18,
              zIndex: 81,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              style={{
                width: 'min(720px, 100%)',
                borderRadius: 18,
                background: 'rgba(20,20,24,.92)',
                border: '1px solid rgba(255,255,255,.08)',
                boxShadow: '0 18px 60px rgba(0,0,0,.55)',
                overflow: 'hidden',
                color: 'rgba(255,255,255,.92)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom: '1px solid rgba(255,255,255,.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(157,109,232,.14)',
                      border: '1px solid rgba(157,109,232,.18)',
                      color: '#9d6de8',
                    }}
                  >
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900 }}>Create meeting</div>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>Pick a reservation + room + time slot</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  aria-label="Close"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,.10)',
                    background: 'rgba(255,255,255,.06)',
                    color: 'rgba(255,255,255,.9)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 16 }}>
                {(errorMessage || localError) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 14,
                      background: 'rgba(255, 92, 92, .10)',
                      border: '1px solid rgba(255, 92, 92, .18)',
                      marginBottom: 12,
                      fontSize: 13,
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>{localError || errorMessage}</span>
                  </div>
                )}

                <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6, fontSize: 12, opacity: 0.9 }}>
                    Active reservation (instrument)
                    <select
                      value={reservationId || ''}
                      onChange={(e) => setReservationId(Number(e.target.value))}
                      disabled={isSubmitting}
                      style={{
                        height: 42,
                        borderRadius: 12,
                        padding: '0 12px',
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(0,0,0,.22)',
                        color: 'rgba(255,255,255,.92)',
                      }}
                    >
                      {activeReservations.length === 0 && <option value="">No active reservations</option>}
                      {activeReservations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.instrument?.name ?? 'Instrument'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12, opacity: 0.9 }}>
                      Day
                      <input
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          height: 42,
                          borderRadius: 12,
                          padding: '0 12px',
                          border: '1px solid rgba(255,255,255,.12)',
                          background: 'rgba(0,0,0,.22)',
                          color: 'rgba(255,255,255,.92)',
                        }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: 6, fontSize: 12, opacity: 0.9 }}>
                      Room
                      <select
                        value={room}
                        onChange={(e) => setRoom(e.target.value as MeetingRoom)}
                        disabled={isSubmitting}
                        style={{
                          height: 42,
                          borderRadius: 12,
                          padding: '0 12px',
                          border: '1px solid rgba(255,255,255,.12)',
                          background: 'rgba(0,0,0,.22)',
                          color: 'rgba(255,255,255,.92)',
                        }}
                      >
                        {ROOMS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12, opacity: 0.9 }}>
                      Start
                      <input
                        type="time"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          height: 42,
                          borderRadius: 12,
                          padding: '0 12px',
                          border: '1px solid rgba(255,255,255,.12)',
                          background: 'rgba(0,0,0,.22)',
                          color: 'rgba(255,255,255,.92)',
                        }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: 6, fontSize: 12, opacity: 0.9 }}>
                      End
                      <input
                        type="time"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          height: 42,
                          borderRadius: 12,
                          padding: '0 12px',
                          border: '1px solid rgba(255,255,255,.12)',
                          background: 'rgba(0,0,0,.22)',
                          color: 'rgba(255,255,255,.92)',
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      style={{
                        height: 42,
                        padding: '0 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(255,255,255,.06)',
                        color: 'rgba(255,255,255,.92)',
                        cursor: 'pointer',
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || activeReservations.length === 0}
                      style={{
                        height: 42,
                        padding: '0 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(157,109,232,.35)',
                        background: 'rgba(157,109,232,.22)',
                        color: 'rgba(255,255,255,.92)',
                        cursor: 'pointer',
                        fontWeight: 900,
                        opacity: isSubmitting ? 0.6 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Plus size={16} /> {isSubmitting ? 'Creating…' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    root,
  );
}