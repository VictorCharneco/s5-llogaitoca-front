import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Guitar, AlertTriangle, RefreshCcw, X, CheckCircle2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

import { useInstruments, useReserveInstrument } from '../hooks/useInstruments';
import type { Instrument, InstrumentStatus, InstrumentType } from '../types';

import styles from './InstrumentsPage.module.css';

const TYPE_OPTIONS: InstrumentType[] = ['STRING', 'WIND', 'PERCUSSION', 'KEYBOARD'];
const STATUS_OPTIONS: InstrumentStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'MAINTENANCE'];
const PAGE_SIZE_OPTIONS = [8, 12, 16] as const;

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function statusLabel(status: Instrument['status']) {
  switch (status) {
    case 'AVAILABLE':
      return 'Available';
    case 'OUT_OF_STOCK':
      return 'Out of stock';
    case 'MAINTENANCE':
      return 'Maintenance';
    default:
      return status;
  }
}

// YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useInstruments();
  const instruments = data ?? [];
  const items = useMemo(() => instruments, [instruments]);

  const reserveMutation = useReserveInstrument();

  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  // ── Filters + pagination (frontend) ─────────────────────────────
  const [typeFilter, setTypeFilter] = useState<InstrumentType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<InstrumentStatus | 'ALL'>('ALL');
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    return items.filter((ins) => {
      const typeOk = typeFilter === 'ALL' || ins.type === typeFilter;
      const statusOk = statusFilter === 'ALL' || ins.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [items, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const resetFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPageSize(12);
    setPage(1);
  };

  // ── Reserve modal state ─────────────────────────────────────────
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveOkOpen, setReserveOkOpen] = useState(false);
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDaysISO(1));

  const openReserve = (ins: Instrument) => {
    setSelected(ins);
    setStartDate(todayISO());
    setEndDate(addDaysISO(1));
    setReserveOpen(true);
  };

  const closeReserve = () => {
    if (reserveMutation.isPending) return;
    setReserveOpen(false);
    setSelected(null);
  };

  const submitReserve = () => {
    if (!selected) return;
    reserveMutation.mutate(
      { instrumentId: selected.id, payload: { start_date: startDate, end_date: endDate } },
      {
        onSuccess: () => {
          setReserveOpen(false);
          setReserveOkOpen(true);
        },
      },
    );
  };

  const closeOk = () => setReserveOkOpen(false);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.eyebrow}>
            Catalogue
          </motion.p>
          <motion.h1 variants={fadeUp} className={styles.title}>
            Instruments
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.sub}>
            Browse and reserve instruments.
          </motion.p>
        </motion.div>
      </section>

      <section className={styles.content}>
        {isLoading && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <RefreshCcw size={18} />
              </div>
              <div className={styles.stateText}>
                <h3>Loading instruments…</h3>
                <p>Please wait.</p>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <AlertTriangle size={18} />
              </div>
              <div className={styles.stateText}>
                <h3>Couldn’t load instruments</h3>
                <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
              <button className={styles.retryBtn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <Guitar size={18} />
              </div>
              <div className={styles.stateText}>
                <h3>No instruments yet</h3>
                <p>Seed the database first.</p>
              </div>
              <button className={styles.retryBtn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <div className={styles.toolbarTitle}>
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Filters
                </div>

                <label className={styles.toolbarField}>
                  <span>Type</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value as any);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">All</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.toolbarField}>
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setPage(1);
                    }}
                  >
                    <option value="ALL">All</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.toolbarField}>
                  <span>Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value) as any);
                      setPage(1);
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="button" className={styles.toolbarBtn} onClick={resetFilters}>
                  Reset
                </button>
              </div>

              <div className={styles.toolbarRight}>
                <span className={styles.toolbarCount}>
                  Showing <b>{pagedItems.length}</b> of <b>{filteredItems.length}</b>
                </span>
              </div>
            </div>

            <motion.div className={styles.grid} variants={stagger} initial="initial" animate="animate">
              {pagedItems.map((ins) => {
                const imgUrl =
                  ins.image_url?.replace('http://127.0.0.1:8000', 'http://localhost:8000') ?? null;
                const failed = Boolean(imgError[ins.id]);
                const canReserve = ins.status === 'AVAILABLE';

                return (
                  <motion.article key={ins.id} className={styles.card} variants={fadeUp}>
                    <div className={styles.cardTop}>
                      <span className={styles.typePill}>{ins.type}</span>
                      <span className={styles.status} data-status={ins.status}>
                        {statusLabel(ins.status)}
                      </span>
                    </div>

                    <div className={styles.media}>
                      {imgUrl && !failed ? (
                        <img
                          className={styles.img}
                          src={imgUrl}
                          alt={ins.name}
                          loading="lazy"
                          onError={() => setImgError((m) => ({ ...m, [ins.id]: true }))}
                        />
                      ) : (
                        <div className={styles.imgFallback} aria-hidden="true">
                          <Guitar size={26} />
                        </div>
                      )}
                    </div>

                    <div className={styles.body}>
                      <h2 className={styles.cardTitle}>{ins.name}</h2>
                      <p className={styles.cardDesc}>{ins.description}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className={styles.primaryBtn}
                        type="button"
                        disabled={!canReserve || reserveMutation.isPending}
                        onClick={() => openReserve(ins)}
                        style={{ cursor: canReserve ? 'pointer' : 'not-allowed', opacity: canReserve ? 1 : 0.7 }}
                      >
                        {canReserve ? 'Reserve' : 'Not available'}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>

            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pagerBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Prev
              </button>

              <div className={styles.pagerInfo}>
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </div>

              <button
                type="button"
                className={styles.pagerBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>

      {/* Reserve modal */}
      {reserveOpen && selected && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle}>Reserve</h3>
                <p className={styles.modalSub}>{selected.name}</p>
              </div>
              <button className={styles.iconBtn} type="button" onClick={closeReserve} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>
                Start date
                <input className={styles.modalInput} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>

              <label className={styles.modalLabel}>
                End date
                <input className={styles.modalInput} type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>

              {reserveMutation.isError && (
                <div className={styles.modalError}>
                  <AlertTriangle size={16} aria-hidden="true" />
                  <div>{reserveMutation.error instanceof Error ? reserveMutation.error.message : 'Could not reserve.'}</div>
                </div>
              )}
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.secondaryBtn} type="button" onClick={closeReserve} disabled={reserveMutation.isPending}>
                Cancel
              </button>
              <button className={styles.primaryBtn} type="button" onClick={submitReserve} disabled={reserveMutation.isPending}>
                {reserveMutation.isPending ? 'Reserving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OK modal */}
      {reserveOkOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle}>Success</h3>
                <p className={styles.modalSub}>Reservation created.</p>
              </div>
              <button className={styles.iconBtn} type="button" onClick={closeOk} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalOk}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <div>All good.</div>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.secondaryBtn} type="button" onClick={closeOk}>
                Stay here
              </button>
              <button className={styles.primaryBtn} type="button" onClick={() => navigate('/app/reservations')}>
                Go to my reservations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}