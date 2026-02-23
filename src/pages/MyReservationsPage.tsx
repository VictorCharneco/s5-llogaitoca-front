// src/pages/MyReservationsPage.tsx
import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Trash2, CornerUpLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useMyReservations, useReturnReservation, useDeleteReservation } from '../hooks/useReservations';
import type { ReservationWithInstrument } from '../types';
import styles from './HeroPage.module.css';

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function statusLabel(status: ReservationWithInstrument['status']) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'FINISHED':
      return 'Returned';
    default:
      return status;
  }
}

function ReservationCard({
  r,
  onReturn,
  onDelete,
  returning,
  deleting,
  canDelete,
}: {
  r: ReservationWithInstrument;
  onReturn: (id: number) => void;
  onDelete: (id: number) => void;
  returning: boolean;
  deleting: boolean;
  canDelete: boolean;
}) {
  const img = r.instrument?.image_url ?? null;

  const canReturn = r.status === 'ACTIVE';

  return (
    <motion.article
      variants={fadeUp}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        background: 'rgba(20,20,24,0.55)',
        padding: 16,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {img ? (
            <img
              src={img}
              alt={r.instrument?.name ?? 'Instrument'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <span style={{ opacity: 0.8 }}>🎸</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 16,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {r.instrument?.name ?? 'Instrument'}
          </div>
          <div style={{ opacity: 0.85, marginTop: 4 }}>
            {r.start_date} → {r.end_date}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            opacity: 0.92,
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel(r.status)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onReturn(r.id)}
          disabled={!canReturn || returning || deleting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: canReturn ? 'rgba(212,168,71,0.18)' : 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.92)',
            cursor: canReturn ? 'pointer' : 'not-allowed',
            opacity: !canReturn || returning || deleting ? 0.6 : 1,
          }}
        >
          <CornerUpLeft size={16} aria-hidden="true" />
          {returning ? 'Returning…' : 'Return'}
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(r.id)}
            disabled={returning || deleting}
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
              opacity: returning || deleting ? 0.6 : 1,
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const q = useMyReservations();
  const returnM = useReturnReservation();
  const deleteM = useDeleteReservation();

  const items = useMemo(() => q.data ?? [], [q.data]);

  const [returningId, setReturningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const onReturn = (id: number) => {
    const ok = window.confirm('Return this reservation?');
    if (!ok) return;

    setReturningId(id);
    returnM.mutate(id, {
      onSettled: () => setReturningId(null),
    });
  };

  const onDelete = (id: number) => {
    const ok = window.confirm('Delete this reservation?');
    if (!ok) return;

    setDeletingId(id);
    deleteM.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 55% 45%, rgba(212,168,71,0.10) 0%, transparent 68%), linear-gradient(180deg,#0e0e11 0%,#111109 100%)',
        }}
      >
        <div className={styles.noise} aria-hidden="true" />
        <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.eyebrow} style={{ color: '#d4a847' }}>
            Your items
          </motion.p>
          <motion.h1 variants={fadeUp} className={styles.title}>
            My reservations
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.sub}>
            Return an active reservation{isAdmin ? ' or delete it from the system' : '.'}
          </motion.p>

          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={() => navigate('/app/instruments')}
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              Back to instruments
            </button>
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.placeholder} style={{ paddingTop: 22 }}>
        {q.isLoading && <div style={{ opacity: 0.85 }}>Loading reservations…</div>}

        {q.isError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(20,20,24,0.55)',
            }}
          >
            <AlertTriangle size={18} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900 }}>Couldn’t load reservations</div>
              <div style={{ opacity: 0.85, marginTop: 2 }}>
                {q.error instanceof Error ? q.error.message : 'Unknown error'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => q.refetch()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              <RefreshCcw size={16} aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {!q.isLoading && !q.isError && items.length === 0 && (
          <div style={{ opacity: 0.85 }}>No reservations found.</div>
        )}

        {!q.isLoading && !q.isError && items.length > 0 && (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 14,
            }}
          >
            {items.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                onReturn={onReturn}
                onDelete={onDelete}
                returning={returningId === r.id && returnM.isPending}
                deleting={deletingId === r.id && deleteM.isPending}
                canDelete={Boolean(isAdmin)}
              />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}