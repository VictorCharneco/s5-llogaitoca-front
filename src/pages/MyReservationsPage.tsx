import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AlertTriangle, RefreshCcw, CornerUpLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
  useMyReservations,
  useReturnReservation,
  useDeleteReservation,
} from '../hooks/useReservations';
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

type Tab = 'ACTIVE' | 'FINISHED';

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

function ReservationRow({
  r,
  tab,
  selected,
  onToggleSelected,
  onReturn,
  onDeleteOne,
  returning,
  deleting,
}: {
  r: ReservationWithInstrument;
  tab: Tab;
  selected: boolean;
  onToggleSelected: (id: number) => void;
  onReturn: (id: number) => void;
  onDeleteOne: (id: number) => void;
  returning: boolean;
  deleting: boolean;
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
        {tab === 'FINISHED' && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelected(r.id)}
            aria-label="Select reservation"
            style={{
              width: 18,
              height: 18,
              accentColor: '#d4a847',
              cursor: 'pointer',
            }}
          />
        )}

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

      {tab === 'ACTIVE' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onReturn(r.id)}
            disabled={!canReturn || returning}
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
              opacity: !canReturn || returning ? 0.6 : 1,
            }}
          >
            <CornerUpLeft size={16} aria-hidden="true" />
            {returning ? 'Returning…' : 'Return'}
          </button>
        </div>
      )}

      {tab === 'FINISHED' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onDeleteOne(r.id)}
            disabled={deleting}
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
              opacity: deleting ? 0.6 : 1,
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </motion.article>
  );
}

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const q = useMyReservations();
  const returnM = useReturnReservation();
  const deleteM = useDeleteReservation();

  const [tab, setTab] = useState<Tab>('ACTIVE');

  const items = useMemo(() => q.data ?? [], [q.data]);
  const activeItems = useMemo(() => items.filter((r) => r.status === 'ACTIVE'), [items]);
  const finishedItems = useMemo(() => items.filter((r) => r.status === 'FINISHED'), [items]);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectedCount = selectedIds.size;

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFinished = () => setSelectedIds(new Set(finishedItems.map((r) => r.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const [returningId, setReturningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isBulkDeleting = deleteM.isPending && deletingId === -1;

  const onReturn = (id: number) => {
    const ok = window.confirm('Return this reservation?');
    if (!ok) return;

    setReturningId(id);
    returnM.mutate(id, { onSettled: () => setReturningId(null) });
  };

  const onDeleteOne = (id: number) => {
    const ok = window.confirm('Remove this finished reservation from your history?');
    if (!ok) return;

    setDeletingId(id);
    deleteM.mutate(id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const deleteSelected = async () => {
    if (selectedCount === 0) return;
    const ok = window.confirm(`Delete ${selectedCount} finished reservations from your history?`);
    if (!ok) return;

    // Bulk delete = múltiples deletes en paralelo
    setDeletingId(-1);

    await Promise.all(
      [...selectedIds].map(
        (id) =>
          new Promise<void>((resolve) => {
            deleteM.mutate(id, {
              onSettled: () => resolve(),
            });
          }),
      ),
    );

    setDeletingId(null);
    clearSelection();
    await q.refetch();
  };

  const clearHistory = async () => {
    if (finishedItems.length === 0) return;
    const ok = window.confirm(`Clear all finished reservations (${finishedItems.length})?`);
    if (!ok) return;

    setDeletingId(-1);

    const ids = finishedItems.map((r) => r.id);
    await Promise.all(
      ids.map(
        (id) =>
          new Promise<void>((resolve) => {
            deleteM.mutate(id, {
              onSettled: () => resolve(),
            });
          }),
      ),
    );

    setDeletingId(null);
    clearSelection();
    await q.refetch();
  };

  const list = tab === 'ACTIVE' ? activeItems : finishedItems;

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
            Active reservations and your finished history.
          </motion.p>

          <motion.div variants={fadeUp} style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setTab('ACTIVE')}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: tab === 'ACTIVE' ? 'rgba(212,168,71,0.18)' : 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              Active ({activeItems.length})
            </button>

            <button
              type="button"
              onClick={() => setTab('FINISHED')}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: tab === 'FINISHED' ? 'rgba(212,168,71,0.18)' : 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              Finished ({finishedItems.length})
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/instruments')}
              style={{
                marginLeft: 'auto',
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

          {tab === 'FINISHED' && (
            <motion.div variants={fadeUp} style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={selectAllFinished}
                disabled={finishedItems.length === 0 || isBulkDeleting}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                  opacity: finishedItems.length === 0 || isBulkDeleting ? 0.6 : 1,
                }}
              >
                Select all
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCount === 0 || isBulkDeleting}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                  opacity: selectedCount === 0 || isBulkDeleting ? 0.6 : 1,
                }}
              >
                Clear selection ({selectedCount})
              </button>

              <button
                type="button"
                onClick={deleteSelected}
                disabled={selectedCount === 0 || isBulkDeleting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,92,92,0.10)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                  opacity: selectedCount === 0 || isBulkDeleting ? 0.6 : 1,
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                {isBulkDeleting ? 'Deleting…' : 'Delete selected'}
              </button>

              <button
                type="button"
                onClick={clearHistory}
                disabled={finishedItems.length === 0 || isBulkDeleting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,92,92,0.10)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                  opacity: finishedItems.length === 0 || isBulkDeleting ? 0.6 : 1,
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                {isBulkDeleting ? 'Deleting…' : 'Clear history'}
              </button>
            </motion.div>
          )}
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

        {!q.isLoading && !q.isError && list.length === 0 && (
          <div style={{ opacity: 0.85 }}>
            {tab === 'ACTIVE' ? 'No active reservations.' : 'No finished reservations.'}
          </div>
        )}

        {!q.isLoading && !q.isError && list.length > 0 && (
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
            {list.map((r) => (
              <ReservationRow
                key={r.id}
                r={r}
                tab={tab}
                selected={selectedIds.has(r.id)}
                onToggleSelected={toggleSelected}
                onReturn={onReturn}
                onDeleteOne={onDeleteOne}
                returning={returningId === r.id && returnM.isPending}
                deleting={deletingId === r.id && deleteM.isPending}
              />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}