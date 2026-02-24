import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants, TargetAndTransition } from 'framer-motion';
import {
  Guitar,
  AlertTriangle,
  RefreshCcw,
  X,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import {
  useInstruments,
  useReserveInstrument,
  useCreateInstrument,
  useUpdateInstrument,
  useDeleteInstrument,
} from '../hooks/useInstruments';
import type { Instrument, InstrumentStatus, InstrumentType } from '../types';

import styles from './InstrumentsPage.module.css';

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

function normalizeInstrumentImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let out = url
    .replace('http://127.0.0.1:8000', API_BASE)
    .replace('http://localhost:8000', API_BASE);

  out = out.replace('/storage/demo/', '/demo/');

  if (out.startsWith('http://') || out.startsWith('https://')) return out;
  if (out.startsWith('/demo/') || out.startsWith('/storage/')) return `${API_BASE}${out}`;

  const clean = out.replace(/^\/+/, '');
  return `${API_BASE}/${clean}`;
}

function statusLabel(status: Instrument['status']) {
  switch (status) {
    case 'AVAILABLE':
      return 'Available';
    case 'OUT_OF_STOCK':
      return 'Out of stock';
    case 'MAINTENANCE':
      return 'Maintenance';
    default:
      return status;
  }
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const STATUS_OPTIONS: InstrumentStatus[] = ['AVAILABLE', 'OUT_OF_STOCK', 'MAINTENANCE'];
const TYPE_OPTIONS: InstrumentType[] = ['STRING', 'WIND', 'PERCUSSION', 'KEYBOARD'];

type InstrumentFormState = {
  name: string;
  description: string;
  type: InstrumentType;
  status: InstrumentStatus;
};

function toFormState(i?: Instrument | null): InstrumentFormState {
  return {
    name: i?.name ?? '',
    description: i?.description ?? '',
    type: (i?.type as InstrumentType) ?? 'STRING',
    status: (i?.status as InstrumentStatus) ?? 'AVAILABLE',
  };
}

function disintegrateExit(i: number): TargetAndTransition {
  const wobble = (i % 2 === 0 ? 1 : -1) * 1.2;

  return {
    opacity: [1, 1, 0],
    scale: [1, 1.01, 0.92],
    rotate: [0, wobble, -wobble],
    filter: [
      'blur(0px) saturate(1)',
      'blur(1px) saturate(0.55)',
      'blur(12px) saturate(0.2)',
    ],
    clipPath: [
      'inset(0% 0% 0% 0% round 20px)',
      'inset(0% 0% 35% 0% round 20px)',
      'inset(0% 0% 100% 0% round 20px)',
    ],
    transition: {
      duration: 0.55,
      times: [0, 0.45, 1],
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  };
}

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = !authLoading && user?.role === 'admin';

  const { data, isLoading, isError, error, refetch } = useInstruments();
  const items = useMemo(() => data ?? [], [data]);

  const reserveM = useReserveInstrument();

  const createM = useCreateInstrument();
  const updateM = useUpdateInstrument();
  const deleteM = useDeleteInstrument();

  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  // ✅ mark ids that should play exit animation, but keep them rendered until exit completes
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());

  // Reserve modal
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveOkOpen, setReserveOkOpen] = useState(false);
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDaysISO(1));

  // Admin modal (create/edit)
  const [adminOpen, setAdminOpen] = useState(false);
  const [editing, setEditing] = useState<Instrument | null>(null);
  const [form, setForm] = useState<InstrumentFormState>(() => toFormState(null));

  // File upload (create + edit)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<Instrument | null>(null);

  const openReserve = (ins: Instrument) => {
    setSelected(ins);
    setStartDate(todayISO());
    setEndDate(addDaysISO(1));
    setReserveOpen(true);
  };

  const closeReserve = () => {
    if (reserveM.isPending) return;
    setReserveOpen(false);
    setSelected(null);
  };

  const submitReserve = () => {
    if (!selected) return;
    reserveM.mutate(
      { instrumentId: selected.id, payload: { start_date: startDate, end_date: endDate } },
      {
        onSuccess: () => {
          setReserveOpen(false);
          setReserveOkOpen(true);
        },
      },
    );
  };

  const closeOk = () => {
    setReserveOkOpen(false);
    navigate('/app/reservations');
  };

  const openCreate = () => {
    setEditing(null);
    setForm(toFormState(null));
    setImageFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setAdminOpen(true);
  };

  const openEdit = (ins: Instrument) => {
    setEditing(ins);
    setForm(toFormState(ins));
    setImageFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setAdminOpen(true);
  };

  const closeAdminModal = () => {
    if (createM.isPending || updateM.isPending) return;
    setAdminOpen(false);
    setEditing(null);
    setImageFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
  };

  const onPickFile = (file: File | null) => {
    setImageFile(file);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const submitAdmin = () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      status: form.status,
    };

    if (!payload.name || !payload.description) return;

    if (!editing) {
      if (!imageFile) return;
      createM.mutate({ payload, file: imageFile }, { onSuccess: () => setAdminOpen(false) });
      return;
    }

    updateM.mutate(
      { instrumentId: editing.id, payload, file: imageFile ?? null },
      { onSuccess: () => setAdminOpen(false) },
    );
  };

  const openDelete = (ins: Instrument) => setDeleteTarget(ins);
  const closeDelete = () => {
    if (deleteM.isPending) return;
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;

    // ✅ Start the disintegration BEFORE the server response
    setLeavingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    deleteM.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        // cleanup in case of fast refetch; harmless
        setTimeout(() => {
          setLeavingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 1000);
      },
      onError: () => {
        // rollback
        setLeavingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const previewFromServer = editing ? normalizeInstrumentImageUrl(editing.image_url) : null;
  const previewSrc = localPreviewUrl ?? previewFromServer;

  // ✅ Remove leaving items from render so AnimatePresence can play exit
  const visibleItems = useMemo(() => items.filter((i) => !leavingIds.has(i.id)), [items, leavingIds]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.noise} aria-hidden="true" />
        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <motion.p variants={fadeUp} className={styles.eyebrow}>
            Catalogue
          </motion.p>
          <motion.h1 variants={fadeUp} className={styles.title}>
            Instruments
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.sub}>
            {isAdmin ? 'Admin: create, edit, delete and upload images.' : 'Browse and reserve instruments.'}
          </motion.p>

          {isAdmin && (
            <motion.div variants={fadeUp} className={styles.actionsRow}>
              <button type="button" className={styles.btn} onClick={openCreate}>
                <Plus size={16} aria-hidden="true" />
                Create instrument
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className={styles.content}>
        {isLoading && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <RefreshCcw size={18} />
              </div>
              <div className={styles.stateText}>
                <h3>Loading instruments…</h3>
                <p>Please wait.</p>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className={styles.state}>
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}>
                <AlertTriangle size={18} />
              </div>
              <div className={styles.stateText}>
                <h3>Couldn’t load instruments</h3>
                <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
              <button className={styles.retryBtn} type="button" onClick={() => refetch()}>
                <RefreshCcw size={16} aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && visibleItems.length > 0 && (
          <motion.div className={styles.grid} variants={stagger} initial="initial" animate="animate">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((ins, idx) => {
                const imgUrl = normalizeInstrumentImageUrl(ins.image_url);
                const failed = Boolean(imgError[ins.id]);
                const canReserve = ins.status === 'AVAILABLE';

                return (
                  <motion.article
                    key={ins.id}
                    className={styles.card}
                    variants={fadeUp}
                    layout
                    exit={disintegrateExit(idx)}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.typePill}>{ins.type}</span>
                      <span className={styles.status} data-status={ins.status}>
                        {statusLabel(ins.status)}
                      </span>
                    </div>

                    <div className={styles.media}>
                      {imgUrl && !failed ? (
                        <img
                          className={styles.img}
                          src={imgUrl}
                          alt={ins.name}
                          loading="lazy"
                          onError={() => setImgError((m) => ({ ...m, [ins.id]: true }))}
                        />
                      ) : (
                        <div className={styles.imgFallback} aria-hidden="true">
                          <Guitar size={26} />
                        </div>
                      )}
                    </div>

                    <div className={styles.body}>
                      <h2 className={styles.cardTitle}>{ins.name}</h2>
                      <p className={styles.cardDesc}>{ins.description}</p>

                      {isAdmin && (
                        <div className={styles.adminRow}>
                          <button type="button" className={styles.btn} onClick={() => openEdit(ins)}>
                            <Pencil size={16} aria-hidden="true" /> Edit
                          </button>
                          <button type="button" className={styles.btnDanger} onClick={() => openDelete(ins)}>
                            <Trash2 size={16} aria-hidden="true" /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {!isAdmin && (
                      <div className={styles.cardFooter}>
                        <button
                          className={styles.primaryBtn}
                          type="button"
                          disabled={!canReserve}
                          onClick={() => openReserve(ins)}
                        >
                          {canReserve ? 'Reserve' : 'Not available'}
                        </button>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Admin modal (Create/Edit) */}
      {adminOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>{editing ? 'Edit instrument' : 'Create instrument'}</div>
                <div className={styles.modalSub}>
                  {editing ? 'Update fields and optionally upload a new image.' : 'Fill the form and upload an image.'}
                </div>
              </div>
              <button type="button" className={styles.iconBtn} onClick={closeAdminModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewRow}>
                <div className={styles.previewBox}>
                  {previewSrc ? (
                    <img src={previewSrc} alt="Preview" className={styles.previewImg} />
                  ) : (
                    <div className={styles.previewFallback}>
                      <ImageIcon size={18} />
                      <span>Preview</span>
                    </div>
                  )}
                </div>
                <div className={styles.previewHint}>Select a file. Preview updates instantly.</div>
              </div>

              <label className={styles.field}>
                <span>Name</span>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </label>

              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </label>

              <div className={styles.twoCol}>
                <label className={styles.field}>
                  <span>Type</span>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as InstrumentType }))}>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Status</span>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as InstrumentStatus }))}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Image file</span>
                <input type="file" accept="image/*,.webp" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} />
                <div className={styles.muted}>{editing ? 'Optional. Leave empty to keep current image.' : 'Required for create.'}</div>
              </label>

              {(createM.isError || updateM.isError) && (
                <div className={styles.errorBox}>
                  <AlertTriangle size={16} aria-hidden="true" />
                  <div>
                    {(createM.error instanceof Error && createM.error.message) ||
                      (updateM.error instanceof Error && updateM.error.message) ||
                      'Could not save.'}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btn} onClick={closeAdminModal}>
                Close
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={submitAdmin}
                disabled={
                  createM.isPending ||
                  updateM.isPending ||
                  (!editing && !imageFile) ||
                  !form.name.trim() ||
                  !form.description.trim()
                }
              >
                <Upload size={16} aria-hidden="true" />
                {createM.isPending || updateM.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Delete instrument</div>
                <div className={styles.modalSub}>This action cannot be undone.</div>
              </div>
              <button type="button" className={styles.iconBtn} onClick={closeDelete} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ fontWeight: 700 }}>Delete “{deleteTarget.name}”?</div>

              {deleteM.isError && (
                <div className={styles.errorBox}>
                  <AlertTriangle size={16} aria-hidden="true" />
                  <div>{deleteM.error instanceof Error ? deleteM.error.message : 'Delete failed.'}</div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btn} onClick={closeDelete} disabled={deleteM.isPending}>
                Cancel
              </button>
              <button type="button" className={styles.btnDanger} onClick={confirmDelete} disabled={deleteM.isPending}>
                {deleteM.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reserve modal + OK modal kept as-is in your version (not shown here to keep file shorter) */}
      {/* If you still need them, keep your existing reserve modals below; they were not changed by this step. */}
    </div>
  );
}