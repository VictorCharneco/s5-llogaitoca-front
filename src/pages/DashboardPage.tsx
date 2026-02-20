import { motion, type Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Guitar, Users, CalendarDays, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

export const INSTRUMENTS_LAYOUT_ID = 'card-instruments';
export const INSTRUMENTS_TAG_ID = `${INSTRUMENTS_LAYOUT_ID}-tag`;
export const INSTRUMENTS_ICON_ID = `${INSTRUMENTS_LAYOUT_ID}-icon`;
export const INSTRUMENTS_TITLE_ID = `${INSTRUMENTS_LAYOUT_ID}-title`;

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const BLOCKS = [
  {
    key: 'instruments',
    to: '/app/instruments',
    icon: Guitar,
    label: 'Instruments',
    desc: 'Browse the full catalogue of available instruments. Reserve what you need, when you need it.',
    gradient: 'linear-gradient(135deg, #1a1608 0%, #2e2208 60%, #3a2d0a 100%)',
    accent: '#d4a847',
    tag: 'Catalogue',
  },
  {
    key: 'meetings',
    to: '/app/meetings',
    icon: Users,
    label: 'Meetings',
    desc: 'Create and join rehearsal sessions in one of four dedicated rooms with up to 4 musicians.',
    gradient: 'linear-gradient(135deg, #0d1520 0%, #0d1f35 60%, #0c2340 100%)',
    accent: '#5ba3d9',
    tag: 'Sessions',
  },
  {
    key: 'calendar',
    to: '/app/calendar',
    icon: CalendarDays,
    label: 'Calendar',
    desc: 'See your upcoming reservations and meetings laid out across the month at a glance.',
    gradient: 'linear-gradient(135deg, #110d1a 0%, #1c1030 60%, #1e1238 100%)',
    accent: '#9d6de8',
    tag: 'Schedule',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroNoise} aria-hidden="true" />
        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.greeting}>
            {greeting}
            {user?.name ? `, ${user.name.split('@')[0]}` : ''} —
          </motion.p>
          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            Your stage
            <br />
            awaits.
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.heroSub}>
            Manage your instruments, book rehearsal rooms, and coordinate with your band.
          </motion.p>
        </motion.div>
        <div className={styles.ring} aria-hidden="true" />
      </section>

      {/* Feature blocks */}
      <section className={styles.blocks}>
        <motion.div
          className={styles.blocksGrid}
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {BLOCKS.map(({ key, to, icon: Icon, label, desc, gradient, accent, tag }) => {
            // Shared-element ONLY for Instruments
            if (key === 'instruments') {
              return (
                <motion.div key={to} variants={fadeUp}>
                  <motion.button
                    type="button"
                    className={styles.block}
                    style={{ background: gradient }}
                    layoutId={INSTRUMENTS_LAYOUT_ID}
                    onClick={() => navigate(to)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <motion.span
                      className={styles.blockTag}
                      style={{ color: accent, borderColor: accent + '33' }}
                      layoutId={INSTRUMENTS_TAG_ID}
                    >
                      {tag}
                    </motion.span>

                    <motion.div
                      className={styles.blockIconWrap}
                      style={{ background: accent + '18' }}
                      layoutId={INSTRUMENTS_ICON_ID}
                    >
                      <Icon size={22} style={{ color: accent }} aria-hidden="true" />
                    </motion.div>

                    <motion.h2 className={styles.blockTitle} layoutId={INSTRUMENTS_TITLE_ID}>
                      {label}
                    </motion.h2>

                    <p className={styles.blockDesc}>{desc}</p>
                    <span className={styles.blockCta} style={{ color: accent }}>
                      Explore <ArrowRight size={14} />
                    </span>
                  </motion.button>
                </motion.div>
              );
            }

            // Normal links for the rest
            return (
              <motion.div key={to} variants={fadeUp}>
                <Link to={to} className={styles.block} style={{ background: gradient }}>
                  <span className={styles.blockTag} style={{ color: accent, borderColor: accent + '33' }}>
                    {tag}
                  </span>
                  <div className={styles.blockIconWrap} style={{ background: accent + '18' }}>
                    <Icon size={22} style={{ color: accent }} aria-hidden="true" />
                  </div>
                  <h2 className={styles.blockTitle}>{label}</h2>
                  <p className={styles.blockDesc}>{desc}</p>
                  <span className={styles.blockCta} style={{ color: accent }}>
                    Explore <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}