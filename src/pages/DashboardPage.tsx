// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const email =
    user && typeof user === 'object' && 'email' in user ? String((user as any).email) : null;

  const onLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.left}>
          <div style={styles.brand}>LLoga i Toca</div>
          <div style={styles.sub}>{email ? `Signed in as ${email}` : 'Signed in'}</div>
        </div>

        <button
          onClick={onLogout}
          disabled={loading}
          style={{
            ...styles.logoutBtn,
            ...(loading ? styles.logoutBtnDisabled : null),
          }}
        >
          {loading ? 'Signing out…' : 'Logout'}
        </button>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.text}>
          Prova de layout per vistes (instruments, calendar, etc.).
        </p>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Estado</div>
          <div style={styles.cardText}>
            Authenticated: <strong style={styles.strong}>YES</strong>
          </div>
          <div style={styles.cardText}>
            API: <code style={styles.code}>{import.meta.env.VITE_API_URL}</code>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: '#f4f5f7',
    color: '#0b0b0c',
  },
  header: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: '#ffffff',
    borderBottom: '1px solid rgba(0,0,0,0.10)',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  brand: {
    fontWeight: 800,
    letterSpacing: -0.3,
    color: '#0b0b0c',
    fontSize: 16,
    lineHeight: '18px',
  },
  sub: {
    fontSize: 12,
    color: '#374151',
    lineHeight: '14px',
  },
  logoutBtn: {
    height: 38,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.18)',
    background: '#0b0b0c',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    lineHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  main: {
    maxWidth: 920,
    margin: '0 auto',
    padding: '28px 20px',
  },
  title: {
    margin: 0,
    fontSize: 30,
    letterSpacing: -0.5,
    color: '#0b0b0c',
  },
  text: {
    marginTop: 10,
    color: '#111827',
    opacity: 0.85,
    fontSize: 14,
    lineHeight: 1.6,
  },
  card: {
    marginTop: 18,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontWeight: 800,
    marginBottom: 8,
  },
  cardText: {
    color: '#111827',
    opacity: 0.9,
    marginTop: 6,
    fontSize: 13,
  },
  strong: {
    color: '#0b0b0c',
  },
  code: {
    background: 'rgba(0,0,0,0.06)',
    padding: '2px 6px',
    borderRadius: 8,
    fontSize: 12,
  },
};
