import { useState, useEffect, useId, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailId    = useId();
  const passwordId = useId();

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Ambient background layers ─────────── */}
      <div className={styles.bgGlow}  aria-hidden="true" />
      <div className={styles.bgNoise} aria-hidden="true" />

      <div className={styles.layout}>

        {/* ── Left half: editorial hero ─────────── */}
        <div className={styles.hero}>
          <motion.div className={styles.heroInner} initial="initial" animate="animate">
            <motion.span custom={0} variants={fadeUp} className={styles.eyebrow}>
              ♩ Llogaitoca
            </motion.span>
            <motion.h1 custom={1} variants={fadeUp} className={styles.heroTitle}>
              Every great<br />
              performance<br />
              starts here.
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className={styles.heroSub}>
              Reserve instruments, book rehearsal rooms
              <br />
              and coordinate sessions — all in one place.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className={styles.heroDivider} />
            <motion.div custom={4} variants={fadeUp} className={styles.heroFootnote}>
              Four rooms &middot; Four roles &middot; Zero friction
            </motion.div>
          </motion.div>
        </div>

        {/* ── Right half: glass form panel ─────── */}
        <div className={styles.panelColumn}>
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Sign in</h2>
              <p className={styles.panelSub}>Enter your credentials to continue</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Sign in form">
              {/* Email */}
              <div className={styles.field}>
                <label htmlFor={emailId} className={styles.label}>
                  Email address
                </label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id={emailId}
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={loading}
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.field}>
                <label htmlFor={passwordId} className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id={passwordId}
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  className={styles.errorBox}
                  role="alert"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button className={styles.btn} type="submit" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}