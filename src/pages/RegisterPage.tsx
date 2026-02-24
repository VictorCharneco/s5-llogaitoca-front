import { useState, useEffect, useId, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { RegisterPayload } from '../types';
import styles from './RegisterPage.module.css';

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ── Frontend validation ──────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

function validate(fields: RegisterPayload): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim())
    errors.name = 'Name is required.';

  if (!fields.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.';

  if (!fields.password)
    errors.password = 'Password is required.';
  else if (fields.password.length < 6)
    errors.password = 'Password must be at least 6 characters.';

  if (!fields.password_confirmation)
    errors.password_confirmation = 'Please confirm your password.';
  else if (fields.password_confirmation !== fields.password)
    errors.password_confirmation = 'Passwords do not match.';

  return errors;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName]                           = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [passwordConfirmation, setPasswordConf]   = useState('');
  const [fieldErrors, setFieldErrors]             = useState<FieldErrors>({});
  const [globalError, setGlobalError]             = useState('');
  const [loading, setLoading]                     = useState(false);

  const nameId    = useId();
  const emailId   = useId();
  const passId    = useId();
  const passConfId = useId();

  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGlobalError('');

    const payload: RegisterPayload = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    };

    // Frontend validation first
    const errors = validate(payload);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await register(payload);
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      // Laravel 422 — field-level errors
      const axiosErr = err as { response?: { status: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosErr?.response?.status === 422 && axiosErr.response.data?.errors) {
        const backendErrors = axiosErr.response.data.errors;
        setFieldErrors({
          name:                  backendErrors.name?.[0],
          email:                 backendErrors.email?.[0],
          password:              backendErrors.password?.[0],
          password_confirmation: backendErrors.password_confirmation?.[0],
        });
      } else {
        setGlobalError(
          axiosErr?.response?.data?.message
          ?? (err instanceof Error ? err.message : 'Registration failed. Please try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow}  aria-hidden="true" />
      <div className={styles.bgNoise} aria-hidden="true" />

      <div className={styles.layout}>

        {/* ── Left: editorial hero ─────────────── */}
        <div className={styles.hero}>
          <motion.div className={styles.heroInner} initial="initial" animate="animate">
            <motion.span custom={0} variants={fadeUp} className={styles.eyebrow}>
              ♩ Llogaitoca
            </motion.span>
            <motion.h1 custom={1} variants={fadeUp} className={styles.heroTitle}>
              Join the<br />ensemble.
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className={styles.heroSub}>
              Create your account and start booking<br />
              instruments and rehearsal rooms today.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className={styles.heroDivider} />
            <motion.div custom={4} variants={fadeUp} className={styles.heroFootnote}>
              Four rooms &middot; Four roles &middot; Zero friction
            </motion.div>
          </motion.div>
        </div>

        {/* ── Right: glass form panel ───────────── */}
        <div className={styles.panelColumn}>
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Create account</h2>
              <p className={styles.panelSub}>Fill in your details to get started</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Register form">

              {/* Name */}
              <div className={styles.field}>
                <label htmlFor={nameId} className={styles.label}>Full name</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id={nameId}
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    autoFocus
                    required
                    disabled={loading}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? `${nameId}-err` : undefined}
                  />
                </div>
                {fieldErrors.name && (
                  <span id={`${nameId}-err`} className={styles.fieldError} role="alert">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className={styles.field}>
                <label htmlFor={emailId} className={styles.label}>Email address</label>
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
                    required
                    disabled={loading}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? `${emailId}-err` : undefined}
                  />
                </div>
                {fieldErrors.email && (
                  <span id={`${emailId}-err`} className={styles.fieldError} role="alert">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className={styles.field}>
                <label htmlFor={passId} className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id={passId}
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? `${passId}-err` : undefined}
                  />
                </div>
                {fieldErrors.password && (
                  <span id={`${passId}-err`} className={styles.fieldError} role="alert">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              {/* Confirm password */}
              <div className={styles.field}>
                <label htmlFor={passConfId} className={styles.label}>Confirm password</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id={passConfId}
                    className={styles.input}
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConf(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    aria-invalid={!!fieldErrors.password_confirmation}
                    aria-describedby={fieldErrors.password_confirmation ? `${passConfId}-err` : undefined}
                  />
                </div>
                {fieldErrors.password_confirmation && (
                  <span id={`${passConfId}-err`} className={styles.fieldError} role="alert">
                    {fieldErrors.password_confirmation}
                  </span>
                )}
              </div>

              {/* Global error */}
              {globalError && (
                <motion.div
                  className={styles.errorBox}
                  role="alert"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{globalError}</span>
                </motion.div>
              )}

              <button className={styles.btn} type="submit" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <><span className={styles.spinner} aria-hidden="true" />Creating account…</>
                ) : (
                  <>Create account <ArrowRight size={16} aria-hidden="true" /></>
                )}
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.switchLink}>Sign in</Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}