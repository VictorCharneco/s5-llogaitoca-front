// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </label>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <p style={styles.hint}>
          (Dev mode) Usa cualquier email/clave para entrar.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f4f5f7',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    padding: 28,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  title: {
    margin: 0,
    marginBottom: 18,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.4,
    color: '#0b0b0c',
  },
  form: {
    display: 'grid',
    gap: 14,
  },
  label: {
    display: 'grid',
    gap: 8,
    fontSize: 13,
    color: '#444',
  },
  input: {
    height: 44,
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    padding: '0 14px',
    outline: 'none',
    fontSize: 14,
  },
  button: {
    height: 44,
    borderRadius: 12,
    border: 'none',
    background: '#0b0b0c',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#b00020',
    fontSize: 13,
    background: 'rgba(176,0,32,0.06)',
    border: '1px solid rgba(176,0,32,0.18)',
    padding: '10px 12px',
    borderRadius: 12,
  },
  hint: {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 12,
    color: '#6b7280',
  },
};
