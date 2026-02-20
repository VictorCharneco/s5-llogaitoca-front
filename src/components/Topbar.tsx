import { useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Topbar.module.css';

const ROUTE_LABELS: Record<string, string> = {
  '/app':             'Dashboard',
  '/app/instruments': 'Instruments',
  '/app/meetings':    'Meetings',
  '/app/calendar':    'Calendar',
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();

  const label = ROUTE_LABELS[pathname] ?? 'Llogaitoca';

  return (
    <header className={styles.topbar} role="banner">
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <span className={styles.title}>{label}</span>

      <div className={styles.right}>
        {user && (
          <span className={styles.userLabel} aria-label={`Signed in as ${user.email}`}>
            {user.name}
          </span>
        )}
        <button
          className={styles.logoutBtn}
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}