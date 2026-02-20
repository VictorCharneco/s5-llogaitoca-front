// src/pages/CalendarPage.tsx
import { motion, type Variants } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import styles from './HeroPage.module.css';

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function CalendarPage() {
  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 55% 45%, rgba(157,109,232,0.10) 0%, transparent 68%), linear-gradient(180deg,#0e0e11 0%,#110d1a 100%)',
        }}
      >
        <div className={styles.noise} aria-hidden="true" />
        <motion.div
          className={styles.content}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeUp}
            className={styles.iconWrap}
            style={{ background: 'rgba(157,109,232,0.1)' }}
          >
            <CalendarDays size={28} style={{ color: '#9d6de8' }} aria-hidden="true" />
          </motion.div>

          <motion.p variants={fadeUp} className={styles.eyebrow} style={{ color: '#9d6de8' }}>
            Schedule
          </motion.p>

          <motion.h1 variants={fadeUp} className={styles.title}>
            Calendar
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.sub}>
            See all upcoming reservations and meetings laid out across the month.
            <br />
            Full calendar view coming next sprint.
          </motion.p>
        </motion.div>
      </section>

      <section className={styles.placeholder}>
        <div className={styles.comingSoon}>
          <span>Calendar grid will appear here</span>
        </div>
      </section>
    </div>
  );
}
