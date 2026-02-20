import { motion, type Variants } from 'framer-motion';
import { Users } from 'lucide-react';
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

export default function MeetingsPage() {
  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 55% 45%, rgba(91,163,217,0.10) 0%, transparent 68%), linear-gradient(180deg,#0e0e11 0%,#0d1520 100%)',
        }}
      >
        <div className={styles.noise} aria-hidden="true" />

        <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
          <motion.div
            variants={fadeUp}
            className={styles.iconWrap}
            style={{ background: 'rgba(91,163,217,0.1)' }}
          >
            <Users size={28} style={{ color: '#5ba3d9' }} aria-hidden="true" />
          </motion.div>

          <motion.p variants={fadeUp} className={styles.eyebrow} style={{ color: '#5ba3d9' }}>
            Sessions
          </motion.p>

          <motion.h1 variants={fadeUp} className={styles.title}>
            Meetings
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.sub}>
            Create and join rehearsal sessions — rooms SPRINGSTEEN, DYLAN,
            <br />
            ARMSTRONG and MARTIN available. Full UI coming next sprint.
          </motion.p>
        </motion.div>
      </section>

      <section className={styles.placeholder}>
        <div className={styles.comingSoon}>
          <span>Meeting cards will appear here</span>
        </div>
      </section>
    </div>
  );
}