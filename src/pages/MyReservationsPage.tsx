import { motion, type Variants } from 'framer-motion';
import { CalendarDays, RefreshCcw } from 'lucide-react';
import { useMyReservations } from '../hooks/useReservations';
import styles from './MyReservationsPage.module.css';

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
    transition: { duration: 0.28 },
  },
};

export default function MyReservationsPage() {
  const { data, isLoading, isError, error, refetch } = useMyReservations();
  const items = data ?? [];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.eyebrow}>
            Your
          </motion.p>
          <motion.h1 variants={fadeUp} className={styles.title}>
            Reservations
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.sub}>
            Everything you booked, in one place.
          </motion.p>
        </motion.div>
      </section>

      <section className={styles.content}>
        {isLoading && <div className={styles.state}>Loading…</div>}

        {isError && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <CalendarDays size={18} aria-hidden="true" />
              <div>
                <strong>Couldn’t load reservations</strong>
                <div className={styles.muted}>
                  {error instanceof Error ? error.message : 'Unknown error'}
                </div>
              </div>
              <button className={styles.btn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <CalendarDays size={18} aria-hidden="true" />
              <div>
                <strong>No reservations yet</strong>
                <div className={styles.muted}>Reserve an instrument and it will appear here.</div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <motion.div className={styles.grid} variants={stagger} initial="initial" animate="animate">
            {items.map((r) => {
              const imgUrl = r.instrument?.image_url ?? null;

              return (
                <motion.article key={r.id} className={styles.card} variants={fadeUp}>
                  <div className={styles.media}>
                    {imgUrl ? <img src={imgUrl} alt={r.instrument?.name ?? 'Instrument'} /> : <div className={styles.fallback} />}
                  </div>

                  <div className={styles.body}>
                    <div className={styles.name}>{r.instrument?.name ?? 'Instrument'}</div>
                    <div className={styles.dates}>
                      {r.start_date} → {r.end_date}
                    </div>
                    <div className={styles.badge} data-status={r.status}>
                      {r.status}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}