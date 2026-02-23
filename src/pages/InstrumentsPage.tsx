import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Guitar, AlertTriangle, RefreshCcw, X, CheckCircle2 } from 'lucide-react';

import { useInstruments, useReserveInstrument } from '../hooks/useInstruments';
import type { Instrument } from '../types';

import styles from './InstrumentsPage.module.css';

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

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useInstruments();
  const instruments = data ?? [];
  const items = useMemo(() => instruments, [instruments]);

  const reserveMutation = useReserveInstrument();

  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  // Modal state
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveOkOpen, setReserveOkOpen] = useState(false);
  const [selected, setSelected] = useState<Instrument | null>(null);

  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());

  const openReserve = (ins: Instrument) => {
    setSelected(ins);
    setStartDate(todayISO());
    setEndDate(todayISO());
    setReserveOpen(true);
  };

  const closeReserve = () => {
    if (reserveMutation.isPending) return;
    setReserveOpen(false);
  };

  const closeOk = () => setReserveOkOpen(false);

  const submitReserve = () => {
    if (!selected) return;

    reserveMutation.mutate(
      {
        instrumentId: selected.id,
        payload: { start_date: startDate, end_date: endDate },
      },
      {
        onSuccess: () => {
          setReserveOpen(false);
          setReserveOkOpen(true);
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.eyebrow}>Catalogue</motion.p>
          <motion.h1 variants={fadeUp} className={styles.title}>Instruments</motion.h1>
          <motion.p variants={fadeUp} className={styles.sub}>
            Browse and reserve instruments. (We’ll polish the visuals later.)
          </motion.p>
        </motion.div>
      </section>

      <section className={styles.content}>
        {isLoading && (
          <div className={styles.grid} aria-label="Loading instruments">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} aria-hidden="true">
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}><AlertTriangle size={18} aria-hidden="true" /></div>
              <div className={styles.stateText}>
                <h3>Couldn’t load instruments</h3>
                <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
              <button className={styles.retryBtn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}><Guitar size={18} aria-hidden="true" /></div>
              <div className={styles.stateText}>
                <h3>No instruments yet</h3>
                <p>Seed the database or create instruments as admin.</p>
              </div>
              <button className={styles.retryBtn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <motion.div className={styles.grid} variants={stagger} initial="initial" animate="animate">
            {items.map((ins) => {
              const imgUrl = ins.image_url?.replace("http://127.0.0.1:8000", "http://localhost:8000") ?? null;
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
                      disabled={!canReserve}
                      onClick={() => openReserve(ins)}
                    >
                      {canReserve ? 'Reserve' : 'Not available'}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Reserve modal */}
      {reserveOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle}>Reserve instrument</h3>
                <p className={styles.modalSub}>{selected?.name}</p>
              </div>
              <button className={styles.iconBtn} type="button" onClick={closeReserve} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {reserveMutation.isError && (
              <div className={styles.modalError}>
                <AlertTriangle size={16} aria-hidden="true" />
                <span>
                  {reserveMutation.error instanceof Error
                    ? reserveMutation.error.message
                    : 'Reservation failed'}
                </span>
              </div>
            )}

            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>
                Start date
                <input
                  className={styles.modalInput}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={reserveMutation.isPending}
                />
              </label>

              <label className={styles.modalLabel}>
                End date
                <input
                  className={styles.modalInput}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={reserveMutation.isPending}
                />
              </label>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.secondaryBtn} type="button" onClick={closeReserve} disabled={reserveMutation.isPending}>
                Cancel
              </button>
              <button className={styles.primaryBtn} type="button" onClick={submitReserve} disabled={reserveMutation.isPending}>
                {reserveMutation.isPending ? 'Reserving…' : 'Confirm reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {reserveOkOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle}>Reservation confirmed</h3>
                <p className={styles.modalSub}>It’s now in your reservations list.</p>
              </div>
              <button className={styles.iconBtn} type="button" onClick={closeOk} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalOk}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{selected?.name ?? 'Instrument'} reserved successfully.</span>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.secondaryBtn} type="button" onClick={closeOk}>
                Stay here
              </button>
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={() => navigate('/app/reservations')}
              >
                Go to my reservations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}