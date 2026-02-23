import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CalendarDays, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import type { Instrument } from '../types';
import styles from './ReserveInstrumentModal.module.css';

type ReservePayload = { start_date: string; end_date: string };

type Props = {
  isOpen: boolean;
  instrument: Instrument | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (payload: ReservePayload) => void;
};

function todayISO() {
  const d = new Date();
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
  const root = document.getElementById('root');

  const [start_date, setStart] = useState('');
  const [end_date, setEnd] = useState('');
  const [localError, setLocalError] = useState<string>('');

  // reset values al abrir
  useEffect(() => {
    if (!isOpen) return;
    const t = todayISO();
    setStart(t);
    setEnd(t);
    setLocalError('');
  }, [isOpen, instrument?.id]);

  // ESC close
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
    setLocalError('');

    if (!start_date || !end_date) {
      setLocalError('Start and end dates are required.');
      return;
    }
    if (end_date < start_date) {
      setLocalError('End date must be after start date.');
      return;
    }

    onConfirm({ start_date, end_date });
  };

  if (!root) return null;

  const imgUrl = instrument?.image_url ?? null;

  return createPortal(
    <AnimatePresence>
      {isOpen && instrument && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.16 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div className={styles.wrap}>
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } }}
              exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.14 } }}
              role="dialog"
              aria-modal="true"
              aria-label="Reserve instrument"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <div className={styles.icon}>
                    <CalendarDays size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className={styles.title}>Reserve</div>
                    <div className={styles.subtitle}>{instrument.name}</div>
                  </div>
                </div>

                <button
                  className={styles.closeBtn}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.body}>
                {/* Preview image (image_url) */}
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,.08)',
                    background: 'rgba(255,255,255,.03)',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 48,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,.10)',
                      background: 'rgba(0,0,0,.18)',
                      display: 'grid',
                      placeItems: 'center',
                      flex: '0 0 auto',
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={instrument.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon size={18} aria-hidden="true" />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{instrument.name}</div>
                    <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                      {instrument.type} · {instrument.status}
                    </div>
                  </div>
                </div>

                {(errorMessage || localError) && (
                  <div className={styles.error}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>{localError || errorMessage}</span>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span>Start date</span>
                      <input
                        type="date"
                        value={start_date}
                        onChange={(e) => setStart(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </label>

                    <label className={styles.field}>
                      <span>End date</span>
                      <input
                        type="date"
                        value={end_date}
                        onChange={(e) => setEnd(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </label>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>

                    <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Reserving…' : 'Confirm reservation'}
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