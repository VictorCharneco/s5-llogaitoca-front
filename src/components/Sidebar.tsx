import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Guitar, Users, CalendarDays, X } from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/app',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/app/instruments', label: 'Instruments', icon: Guitar },
  { to: '/app/meetings',    label: 'Meetings',    icon: Users },
  { to: '/app/calendar',    label: 'Calendar',    icon: CalendarDays },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function NavItems() {
  return (
    <nav aria-label="Main navigation">
      <ul className={styles.navList}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.active : ''].join(' ')
              }
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop dock (always visible ≥769px) ── */}
      <aside className={styles.dock} aria-label="Sidebar navigation">
        <div className={styles.brand}>
          <span className={styles.brandMark}>♩</span>
          <span className={styles.brandName}>Llogaitoca</span>
        </div>
        <NavItems />
      </aside>

      {/* ── Mobile drawer ──────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className={styles.drawer}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
          >
            <div className={styles.drawerHeader}>
              <div className={styles.brand}>
                <span className={styles.brandMark}>♩</span>
                <span className={styles.brandName}>Llogaitoca</span>
              </div>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <NavItems />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}