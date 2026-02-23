import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X, Users, LogIn, LogOut, Trash2, Shield } from 'lucide-react';
import type { MeetingStatus, MeetingWithRelations, User } from '../types';

type Props = {
  isOpen: boolean;
  meeting: MeetingWithRelations | null;
  isAdmin: boolean;
  isMember: boolean;
  busy: boolean;

  onClose: () => void;
  onJoin: (id: number) => void;
  onQuit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatus: (id: number, status: MeetingStatus) => void;
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

function UserRow({ u }: { u: User }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.18)',
      }}
    >
      <div style={{ fontWeight: 800 }}>{u.name}</div>
      <div style={{ opacity: 0.75 }}>{u.role}</div>
    </div>
  );
}

export default function MeetingsDetailsModal({
  isOpen,
  meeting,
  isAdmin,
  isMember,
  busy,
  onClose,
  onJoin,
  onQuit,
  onDelete,
  onStatus,
}: Props) {
  const root = document.getElementById('root');
  if (!root) return null;

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
                width: 'min(860px, 100%)',
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: 22 }}>{meeting.room}</div>

                    {/* ID del meeting sí puede ser útil, pero NO mostramos reservation_id */}
                    <span
                      style={{
                        fontSize: 12,
                        opacity: 0.85,
                        padding: '4px 10px',
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
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: '1px solid rgba(255,255,255,0.10)',
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <Shield size={14} /> admin
                      </span>
                    )}
                  </div>

                  <div style={{ opacity: 0.8, marginTop: 10, fontSize: 18 }}>
                    {meeting.day} · {hhmm(meeting.start_time)}–{hhmm(meeting.end_time)}
                  </div>

                  <div style={{ opacity: 0.85, marginTop: 10 }}>
                    Status: <strong>{meeting.status}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  aria-label="Close"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,.10)',
                    background: 'rgba(255,255,255,.06)',
                    color: 'rgba(255,255,255,.9)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 16 }}>
                <div
                  style={{
                    borderRadius: 18,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.14)',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={18} aria-hidden="true" />
                    <div style={{ fontWeight: 900, fontSize: 20 }}>
                      {(meeting.users?.length ?? meeting.users_count ?? 0)} participants
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {(meeting.users ?? []).map((u) => (
                      <UserRow key={u.id} u={u} />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* ✅ Join/Quit real según isMember */}
                  {!isMember ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onJoin(meeting.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(91,163,217,0.18)',
                        color: 'rgba(255,255,255,0.92)',
                        cursor: 'pointer',
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      <LogIn size={16} /> Join
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onQuit(meeting.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 14,
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

                  {/* Edit lo dejamos next sprint */}
                  <button
                    type="button"
                    disabled
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.55)',
                      cursor: 'not-allowed',
                    }}
                  >
                    Edit (next)
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
                          padding: '10px 14px',
                          borderRadius: 14,
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
                          height: 42,
                          borderRadius: 14,
                          padding: '0 12px',
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