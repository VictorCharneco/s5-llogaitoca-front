import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCcw, CornerUpLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
  useMyReservations,
  useAllReservations,
  useReturnReservation,
  useDeleteReservation,
} from '../hooks/useReservations';
import type { ReservationWithInstrument } from '../types';
import styles from './MyReservationsPage.module.css';

type Tab = 'ACTIVE' | 'FINISHED';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

function normalizeAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let out = url
    .replace('http://127.0.0.1:8000', API_BASE)
    .replace('http://localhost:8000', API_BASE)
    // demo assets live in /demo, not /storage/demo
    .replace('/storage/demo/', '/demo/');

  if (out.startsWith('http://') || out.startsWith('https://')) return out;
  if (out.startsWith('/demo/') || out.startsWith('/storage/')) return `${API_BASE}${out}`;
  return `${API_BASE}/${out.replace(/^\/+/, '')}`;
}

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
  const img = normalizeAssetUrl(r.instrument?.image_url);
  const canReturn = r.status === 'ACTIVE';

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {img ? (
          <img src={img} alt={r.instrument?.name ?? 'Instrument'} loading="lazy" />
        ) : (
          <div className={styles.fallback} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{r.instrument?.name ?? 'Instrument'}</div>
        <div className={styles.dates}>
          {r.start_date} → {r.end_date}
        </div>

        <span className={styles.badge} data-status={r.status}>
          {statusLabel(r.status)}
        </span>

        {tab === 'ACTIVE' && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onReturn(r.id)}
              disabled={!canReturn || returning}
              className={styles.btn}
              style={{ opacity: !canReturn || returning ? 0.6 : 1 }}
            >
              <CornerUpLeft size={16} aria-hidden="true" />
              {returning ? 'Returning…' : 'Return'}
            </button>
          </div>
        )}

        {tab === 'FINISHED' && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelected(r.id)}
                aria-label="Select reservation"
                style={{ width: 18, height: 18, accentColor: '#d4a847' }}
              />
              <span style={{ opacity: 0.82, fontSize: 13 }}>Select</span>
            </label>

            <button
              type="button"
              onClick={() => onDeleteOne(r.id)}
              disabled={deleting}
              className={styles.btn}
              style={{ opacity: deleting ? 0.6 : 1 }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.state}>
            <div className={styles.stateCard}>Loading reservations…</div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  // ✅ NO tocamos la lógica que ya te funcionaba:
  // - user -> /reservations/my
  // - admin -> /reservations (all)
  const myQ = useMyReservations(!isAdmin);
  const allQ = useAllReservations(isAdmin);
  const q = isAdmin ? allQ : myQ;

  const returnM = useReturnReservation();
  const deleteM = useDeleteReservation();

  const [tab, setTab] = useState<Tab>('ACTIVE');

  // Snapshot estable de datos (para evitar “vacíos” raros al cambiar tabs)
  const [itemsState, setItemsState] = useState<ReservationWithInstrument[]>([]);
  useEffect(() => {
    if (Array.isArray(q.data)) setItemsState(q.data);
  }, [q.data]);

  const items = itemsState;

  const activeItems = useMemo(() => items.filter((r) => r.status === 'ACTIVE'), [items]);
  const finishedItems = useMemo(() => items.filter((r) => r.status === 'FINISHED'), [items]);
  const list = tab === 'ACTIVE' ? activeItems : finishedItems;

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
    const ok = window.confirm('Remove this finished reservation from history?');
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
    const ok = window.confirm(`Delete ${selectedCount} finished reservations from history?`);
    if (!ok) return;

    setDeletingId(-1);
    await Promise.all(
      [...selectedIds].map(
        (id) =>
          new Promise<void>((resolve) => {
            deleteM.mutate(id, { onSettled: () => resolve() });
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
            deleteM.mutate(id, { onSettled: () => resolve() });
          }),
      ),
    );
    setDeletingId(null);
    clearSelection();
    await q.refetch();
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{isAdmin ? 'Admin' : 'Your items'}</p>
          <h1 className={styles.title}>{isAdmin ? 'All reservations' : 'My reservations'}</h1>
          <p className={styles.sub}>
            {isAdmin ? 'All active reservations and finished history.' : 'Active reservations and your finished history.'}
          </p>

          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setTab('ACTIVE')} className={styles.btn}>
              Active ({activeItems.length})
            </button>
            <button type="button" onClick={() => setTab('FINISHED')} className={styles.btn}>
              Finished ({finishedItems.length})
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/instruments')}
              className={styles.btn}
              style={{ marginLeft: 'auto' }}
            >
              Back to instruments
            </button>
          </div>

          {tab === 'FINISHED' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={selectAllFinished}
                disabled={finishedItems.length === 0 || isBulkDeleting}
                className={styles.btn}
                style={{ opacity: finishedItems.length === 0 || isBulkDeleting ? 0.6 : 1 }}
              >
                Select all
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCount === 0 || isBulkDeleting}
                className={styles.btn}
                style={{ opacity: selectedCount === 0 || isBulkDeleting ? 0.6 : 1 }}
              >
                Clear selection ({selectedCount})
              </button>

              <button
                type="button"
                onClick={deleteSelected}
                disabled={selectedCount === 0 || isBulkDeleting}
                className={styles.btn}
                style={{ opacity: selectedCount === 0 || isBulkDeleting ? 0.6 : 1 }}
              >
                <Trash2 size={16} aria-hidden="true" />
                {isBulkDeleting ? 'Deleting…' : 'Delete selected'}
              </button>

              <button
                type="button"
                onClick={clearHistory}
                disabled={finishedItems.length === 0 || isBulkDeleting}
                className={styles.btn}
                style={{ opacity: finishedItems.length === 0 || isBulkDeleting ? 0.6 : 1 }}
              >
                <Trash2 size={16} aria-hidden="true" />
                {isBulkDeleting ? 'Deleting…' : 'Clear history'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.content}>
        {q.isError && items.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <AlertTriangle size={18} aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900 }}>Couldn’t load reservations</div>
                <div className={styles.muted}>{q.error instanceof Error ? q.error.message : 'Unknown error'}</div>
              </div>
              <button type="button" onClick={() => q.refetch()} className={styles.btn}>
                <RefreshCcw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        )}

        {q.isLoading && items.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>Loading reservations…</div>
          </div>
        )}

        {list.length > 0 && (
          <div className={styles.grid}>
            {list.map((r) => (
              <ReservationCard
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
          </div>
        )}

        {!q.isLoading && !q.isError && list.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              {tab === 'ACTIVE' ? 'No active reservations.' : 'No finished reservations.'}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}