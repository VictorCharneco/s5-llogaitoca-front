import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Users, AlertTriangle, RefreshCcw } from 'lucide-react';

import MeetingsDetailsModal from '../components/MeetingsDetailsModal';
import { useMyMeetings, useAllMeetings } from '../hooks/useMeetings';
import type { MeetingWithRelations } from '../types';
import styles from './HeroPage.module.css';

import { useAuth } from '../context/AuthContext';

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function hhmm(t: string) {
  return t?.slice(0, 5) ?? '';
}

function MeetingCard({ m }: { m: MeetingWithRelations }) {
  return (
    <motion.article
      variants={fadeUp}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        background: 'rgba(20,20,24,0.55)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{m.room}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            {m.day} · {hhmm(m.start_time)}–{hhmm(m.end_time)}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
          <div style={{ fontWeight: 800 }}>{m.status}</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', opacity: 0.85 }}>
        <Users size={16} aria-hidden="true" />
        <span>{m.users_count ?? 0} participants</span>
      </div>
    </motion.article>
  );
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [mode, setMode] = useState<'my' | 'all'>('my');

  const myQuery = useMyMeetings();
  const allQuery = useAllMeetings(isAdmin && mode === 'all');

  const active = mode === 'my' ? myQuery : allQuery;
  const items = useMemo(() => active.data ?? [], [active.data]);

  // ✅ Hooks dentro del componente
  const [selected, setSelected] = useState<MeetingWithRelations | null>(null);
  const openDetails = (m: MeetingWithRelations) => setSelected(m);
  const closeDetails = () => setSelected(null);

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
          <motion.div variants={fadeUp} className={styles.iconWrap} style={{ background: 'rgba(91,163,217,0.1)' }}>
            <Users size={28} style={{ color: '#5ba3d9' }} aria-hidden="true" />
          </motion.div>

          <motion.p variants={fadeUp} className={styles.eyebrow} style={{ color: '#5ba3d9' }}>
            Sessions
          </motion.p>

          <motion.h1 variants={fadeUp} className={styles.title}>
            Meetings
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.sub}>
            View your meetings{isAdmin ? ' (and optionally all meetings)' : ''}. Click a card to view details.
          </motion.p>

          <motion.div variants={fadeUp} style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setMode('my')}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.10)',
                background: mode === 'my' ? 'rgba(91,163,217,0.18)' : 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              My meetings
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setMode('all')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: mode === 'all' ? 'rgba(91,163,217,0.18)' : 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                }}
              >
                All meetings
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.placeholder} style={{ paddingTop: 22 }}>
        {active.isLoading && <div style={{ opacity: 0.8 }}>Loading meetings…</div>}

        {active.isError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(20,20,24,0.55)',
            }}
          >
            <AlertTriangle size={18} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>Couldn’t load meetings</div>
              <div style={{ opacity: 0.85, marginTop: 2 }}>
                {active.error instanceof Error ? active.error.message : 'Unknown error'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => active.refetch()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              <RefreshCcw size={16} aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {!active.isLoading && !active.isError && items.length === 0 && (
          <div style={{ opacity: 0.85 }}>No meetings found.</div>
        )}

        {!active.isLoading && !active.isError && items.length > 0 && (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14,
            }}
          >
            {items.map((m) => (
              <div key={m.id} onClick={() => openDetails(m)} style={{ cursor: 'pointer' }}>
                <MeetingCard m={m} />
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Modal (por ahora solo detalle + close; acciones las metemos en el siguiente paso) */}
      <MeetingsDetailsModal
        isOpen={Boolean(selected)}
        meeting={selected}
        context={mode}
        isAdmin={isAdmin}
        // En la vista "my", eres miembro seguro => evita mostrar Join
        isMember={mode === 'my' ? true : false}
        busy={false}
        onClose={closeDetails}
        onJoin={() => {}}
        onQuit={() => {}}
        onDelete={() => {}}
        onStatus={() => {}}
      />
    </div>
  );
}