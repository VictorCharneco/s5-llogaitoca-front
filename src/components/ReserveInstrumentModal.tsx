import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { X, CalendarDays, AlertTriangle } from 'lucide-react';
import type { Instrument } from '../types';
import { instrumentImageUrl } from '../api/instruments.service';
import styles from './ReserveInstrumentModal.module.css';

type Props = {
  isOpen: boolean;
  instrument: Instrument | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (payload: { start_date: string; end_date: string }) => void;
};

const overlayV: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

const panelV: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.16 } },
};

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

export default function ReserveInstrumentModal({
  isOpen,
  instrument,
  isSubmitting = false,
  errorMessage,
  onClose,
  onConfirm,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // defaults “sensatos”
  const defaultStart = useMemo(() => todayISO(), []);
  const defaultEnd = useMemo(() => addDaysISO(2), []);

  const [start_date, setStartDate] = useState(defaultStart);
  const [end_date, setEndDate] = useState(defaultEnd);

  useEffect(() => {
    setMounted(true);
  }, []);

  // reset form cada vez que se abre / cambia instrumento
  useEffect(() => {
    if (!isOpen) return;
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, [isOpen, instrument?.id, defaultStart, defaultEnd]);

  // ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm({ start_date, end_date });
  };

  if (!mounted) return null;

  const root = document.getElementById('root');
  if (!root) return null;

  const imgUrl = instrument?.image_url?.replace("http://127.0.0.1:8000", "http://localhost:8000") ?? null;

  return createPortal(
    <AnimatePresence>
      {isOpen && instrument && (
        <>
          <motion.div
            className={styles.overlay}
            variants={overlayV}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div className={styles.wrap} aria-hidden={false}>
            <motion.div
              className={styles.panel}
              variants={panelV}
              initial="initial"
              animate="animate"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Reserve instrument"
            >
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <div className={styles.icon}>
                    <CalendarDays size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className={styles.title}>Reserve</div>
                    <div className={styles.subtitle}>Choose your dates</div>
                  </div>
                </div>

                <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className={styles.body}>
                <div className={styles.instrumentCard}>
                  <div className={styles.instrumentMedia}>
                    {imgUrl ? (
                      <img className={styles.instrumentImg} src={imgUrl} alt={instrument.name} />
                    ) : (
                      <div className={styles.instrumentFallback} aria-hidden="true">
                        {instrument.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={styles.instrumentInfo}>
                    <div className={styles.instrumentName}>{instrument.name}</div>
                    <div className={styles.instrumentDesc}>{instrument.description}</div>

                    <div className={styles.pills}>
                      <span className={styles.pill}>{instrument.type}</span>
                      <span className={styles.pill} data-status={instrument.status}>
                        {instrument.status}
                      </span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className={styles.error}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span>Start date</span>
                      <input
                        type="date"
                        value={start_date}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </label>

                    <label className={styles.field}>
                      <span>End date</span>
                      <input
                        type="date"
                        value={end_date}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </label>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.secondaryBtn} type="button" onClick={onClose} disabled={isSubmitting}>
                      Cancel
                    </button>
                    <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Reserving…' : 'Confirm reservation'}
                    </button>
                  </div>

                  <p className={styles.hint}>
                    Tip: your backend requires <code>start_date</code> and <code>end_date</code>.
                  </p>
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