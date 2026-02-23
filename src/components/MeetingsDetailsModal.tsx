import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X, Users, LogIn, LogOut, Trash2, Shield, Pencil } from 'lucide-react';
import type { MeetingStatus, MeetingWithRelations, User } from '../types';

type ModalContext = 'my' | 'all';

type Props = {
  isOpen: boolean;
  meeting: MeetingWithRelations | null;

  context: ModalContext;

  isAdmin: boolean;
  isMember: boolean; // usado solo en context='all'
  busy: boolean;

  onClose: () => void;
  onJoin: (id: number) => void;
  onQuit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatus: (id: number, status: MeetingStatus) => void;

  // 🔜 next sprint: edición real
  onEdit?: (meeting: MeetingWithRelations) => void;
};

const overlayV: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const panelV: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.14 } },
};

function hhmm(t: string) {
  return t?.slice(0, 5) ?? '';
}

const STATUSES: MeetingStatus[] = ['ACTIVE', 'FINISHED', 'CANCELLED'];

function displayName(u: User) {
  // por si en tu seed usas name tipo "Admin" y no emails
  return u?.name || u?.email || `User #${u?.id}`;
}

export default function MeetingsDetailsModal({
  isOpen,
  meeting,
  context,
  isAdmin,
  isMember,
  busy,
  onClose,
  onJoin,
  onQuit,
  onDelete,
  onStatus,
  onEdit,
}: Props) {
  const root = document.getElementById('root');
  if (!root) return null;

  const isClosed = meeting?.status === 'FINISHED' || meeting?.status === 'CANCELLED';

  const showQuit = !isClosed && (context === 'my' || (context === 'all' && isMember));
  const showJoin = !isClosed && context === 'all' && !isMember;

  // Participants list: solo si el backend los envía en meeting.users
  const participants = (meeting?.users ?? []) as User[];

  return createPortal(
    <AnimatePresence>
      {isOpen && meeting && (
        <>
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 70,
            }}
            variants={overlayV}
            initial="initial"
            animate="animate"
            exit="exit"
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
              zIndex: 71,
            }}
          >
            <motion.div
              variants={panelV}
              initial="initial"
              animate="animate"
              exit="exit"
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
              {/* Header */}
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{meeting.room}</div>

                    <span
                      style={{
                        fontSize: 12,
                        opacity: 0.85,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      #{meeting.id}
                    </span>

                    {isAdmin && (
                      <span
                        style={{
                          fontSize: 12,
                          opacity: 0.85,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.10)',
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <Shield size={14} /> admin
                      </span>
                    )}
                  </div>

                  <div style={{ opacity: 0.8, marginTop: 8 }}>
                    {meeting.day} · {hhmm(meeting.start_time)}–{hhmm(meeting.end_time)}
                  </div>

                  <div style={{ opacity: 0.8, marginTop: 8 }}>
                    Status: <strong>{meeting.status}</strong>
                    {isClosed && <span style={{ marginLeft: 8, opacity: 0.8 }}>(read only)</span>}
                  </div>

                  {isAdmin && (
                    <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>
                        Reservation ID: <strong>{meeting.reservation_id}</strong>
                    </div>
                    )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
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
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: 16, display: 'grid', gap: 16 }}>
                {/* Participants */}
                <div
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
                    <Users size={16} aria-hidden="true" />
                    <span style={{ fontWeight: 800 }}>
                      {meeting.users_count ?? participants.length ?? 0} participants
                    </span>
                  </div>

                  {participants.length > 0 ? (
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {participants.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(0,0,0,0.18)',
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{displayName(u)}</div>
                          <div style={{ opacity: 0.75, fontSize: 13 }}>{u.role}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
                      No participant list provided by API for this endpoint.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {showJoin && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onJoin(meeting.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(91,163,217,0.18)',
                        color: 'rgba(255,255,255,0.92)',
                        cursor: 'pointer',
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      <LogIn size={16} /> Join
                    </button>
                  )}

                  {showQuit && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onQuit(meeting.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.92)',
                        cursor: 'pointer',
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      <LogOut size={16} /> Quit
                    </button>
                  )}

                  {/* Edit: lo dejamos preparado pero disabled hasta que tengamos UX + endpoint */}
                  <button
                    type="button"
                    disabled
                    onClick={() => onEdit?.(meeting)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.55)',
                      cursor: 'not-allowed',
                    }}
                    title="Edit meeting (next sprint)"
                  >
                    <Pencil size={16} /> Edit (next)
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete(meeting.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,92,92,0.10)',
                          color: 'rgba(255,255,255,0.92)',
                          cursor: 'pointer',
                          opacity: busy ? 0.6 : 1,
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>

                      <select
                        disabled={busy}
                        value={meeting.status}
                        onChange={(e) => onStatus(meeting.id, e.target.value as MeetingStatus)}
                        style={{
                          height: 40,
                          borderRadius: 12,
                          padding: '0 10px',
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(0,0,0,0.25)',
                          color: 'rgba(255,255,255,0.92)',
                          opacity: busy ? 0.6 : 1,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    root,
  );
}