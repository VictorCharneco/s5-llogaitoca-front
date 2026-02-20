import { motion, type Variants } from 'framer-motion';
import { Guitar } from 'lucide-react';
import styles from './InstrumentsPage.module.css';
import {
  INSTRUMENTS_LAYOUT_ID,
  INSTRUMENTS_TAG_ID,
  INSTRUMENTS_ICON_ID,
  INSTRUMENTS_TITLE_ID,
} from './DashboardPage';

const fadeUp: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function InstrumentsPage() {
  const accent = '#d4a847';
  const gradient =
    'radial-gradient(ellipse 65% 55% at 55% 45%, rgba(212,168,71,0.10) 0%, transparent 68%), linear-gradient(180deg,#0e0e11 0%,#111109 100%)';

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero} style={{ background: gradient }} layoutId={INSTRUMENTS_LAYOUT_ID}>
        <div className={styles.noise} aria-hidden="true" />

        <div className={styles.content}>
          <motion.span
            className={styles.tag}
            style={{ color: accent, borderColor: accent + '33' }}
            layoutId={INSTRUMENTS_TAG_ID}
          >
            Catalogue
          </motion.span>

          <motion.div className={styles.iconWrap} style={{ background: `${accent}18` }} layoutId={INSTRUMENTS_ICON_ID}>
            <Guitar size={28} style={{ color: accent }} aria-hidden="true" />
          </motion.div>

          <motion.h1 className={styles.title} layoutId={INSTRUMENTS_TITLE_ID}>
            Instruments
          </motion.h1>

          <motion.p variants={fadeUp} initial="initial" animate="animate" className={styles.sub}>
            Browse, filter and reserve instruments from our full catalogue.
            <br />
            Data and filtering coming next sprint.
          </motion.p>
        </div>
      </motion.section>

      <section className={styles.placeholder}>
        <div className={styles.comingSoon}>
          <span>Instrument cards will appear here</span>
        </div>
      </section>
    </div>
  );
}