import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';

import { useMyReservations } from '../hooks/useReservations';
import {
  useAvailableMeetings,
  useCreateMeeting,
  useJoinMeeting,
  useQuitMeeting,
  useDeleteMeeting,
  useUpdateMeetingStatus,
} from '../hooks/useMeetings';

import CalendarMeetingModal from '../components/CalendarMeetingModal';
import MeetingsDetailsModal from '../components/MeetingsDetailsModal';
import { useAuth } from '../context/AuthContext';
import type { MeetingWithRelations } from '../types';

import styles from './HeroPage.module.css';

type FcEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, any>;
};

function addOneDay(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split('-').map((n) => Number(n));
  const dt = new Date(y, m - 1, d);

  dt.setDate(dt.getDate() + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function toHHMM(date: Date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const reservationsQ = useMyReservations();

  const meetingsQ = useAvailableMeetings();

  const createMeetingM = useCreateMeeting();

  const joinM = useJoinMeeting();
  const quitM = useQuitMeeting();
  const delM = useDeleteMeeting();
  const statusM = useUpdateMeetingStatus();

  const busy =
    joinM.isPending || quitM.isPending || delM.isPending || statusM.isPending;

  const isLoading = reservationsQ.isLoading || meetingsQ.isLoading;
  const isError = reservationsQ.isError || meetingsQ.isError;

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedStart, setPickedStart] = useState<string | null>(null);
  const [pickedEnd, setPickedEnd] = useState<string | null>(null);

  // Meeting details modal
  const [selected, setSelected] = useState<MeetingWithRelations | null>(null);
  const isMember = Boolean(selected?.users?.some((u) => u.id === user?.id));

  // ✅ Si cambia la lista (por refetch tras Join/Quit), reengancha "selected" a la versión actualizada
  useEffect(() => {
    if (!selected) return;
    const updated =
      (meetingsQ.data ?? []).find((m) => m.id === selected.id) ?? null;

    if (updated) setSelected(updated);
  }, [meetingsQ.data, selected?.id]);

  const closeCreate = () => setCreateOpen(false);
  const closeDetails = () => setSelected(null);

  const events = useMemo<FcEvent[]>(() => {
    const res = reservationsQ.data ?? [];
    const meets = meetingsQ.data ?? [];

    const reservationEvents: FcEvent[] = res.map((r) => ({
      id: `res-${r.id}`,
      title: `🎸 ${r.instrument?.name ?? 'Instrument'}`,
      start: r.start_date,
      end: addOneDay(r.end_date),
      allDay: true,
      backgroundColor: 'rgba(212,168,71,0.18)',
      borderColor: 'rgba(212,168,71,0.35)',
      textColor: 'rgba(255,255,255,0.92)',
      extendedProps: { kind: 'reservation' },
    }));

    const meetingEvents: FcEvent[] = meets.map((m) => ({
      id: `meet-${m.id}`,
      title: `👥 ${m.room}`,
      start: `${m.day}T${m.start_time}`,
      end: `${m.day}T${m.end_time}`,
      allDay: false,
      backgroundColor: 'rgba(91,163,217,0.18)',
      borderColor: 'rgba(91,163,217,0.35)',
      textColor: 'rgba(255,255,255,0.92)',
      extendedProps: { kind: 'meeting', meetingId: m.id },
    }));

    return [...reservationEvents, ...meetingEvents];
  }, [reservationsQ.data, meetingsQ.data]);

  const onSelect = (arg: DateSelectArg) => {
    const day = arg.start.toISOString().slice(0, 10);
    const start = toHHMM(arg.start);
    const end = toHHMM(arg.end);

    setPickedDay(day);
    setPickedStart(arg.allDay ? null : start);
    setPickedEnd(arg.allDay ? null : end);
    setCreateOpen(true);

    arg.view.calendar.unselect();
  };

  const onEventClick = (arg: EventClickArg) => {
    const kind = (arg.event.extendedProps as any)?.kind;
    if (kind !== 'meeting') return;

    const meetingId = Number((arg.event.extendedProps as any)?.meetingId);
    const m = (meetingsQ.data ?? []).find((x) => x.id === meetingId) ?? null;
    setSelected(m);
  };

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 55% 45%, rgba(157,109,232,0.10) 0%, transparent 68%), linear-gradient(180deg,#0e0e11 0%,#110d1a 100%)',
        }}
      >
        <div className={styles.noise} aria-hidden="true" />
        <div className={styles.content}>
          <div
            className={styles.iconWrap}
            style={{ background: 'rgba(157,109,232,0.10)' }}
            aria-hidden="true"
          >
            <span style={{ color: '#9d6de8', fontSize: 22, fontWeight: 900 }}>
              📅
            </span>
          </div>
          <p className={styles.eyebrow} style={{ color: '#9d6de8' }}>
            Schedule
          </p>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.sub}>
            Drag a time slot to create a meeting. Click a meeting to join/quit.
          </p>
        </div>
      </section>

      <section className={styles.placeholder} style={{ paddingTop: 18 }}>
        {isLoading && <div style={{ opacity: 0.85 }}>Loading calendar…</div>}

        {isError && (
          <div style={{ opacity: 0.9 }}>
            Couldn’t load calendar data.
            <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
              {reservationsQ.error instanceof Error
                ? reservationsQ.error.message
                : ''}
              {meetingsQ.error instanceof Error
                ? ` ${meetingsQ.error.message}`
                : ''}
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <div
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(20,20,24,0.55)',
              padding: 10,
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay,dayGridMonth',
              }}
              height="auto"
              events={events}
              selectable
              selectMirror
              select={onSelect}
              eventClick={onEventClick}
              nowIndicator
              dayMaxEvents={3}
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
            />
          </div>
        )}
      </section>

      <CalendarMeetingModal
        isOpen={createOpen}
        defaultDay={pickedDay}
        defaultStart={pickedStart}
        defaultEnd={pickedEnd}
        reservations={reservationsQ.data ?? []}
        isSubmitting={createMeetingM.isPending}
        errorMessage={
          createMeetingM.error instanceof Error
            ? createMeetingM.error.message
            : null
        }
        onClose={closeCreate}
        onConfirmCreate={(payload) =>
          createMeetingM.mutate(payload, { onSuccess: closeCreate })
        }
      />

      <MeetingsDetailsModal
        isOpen={Boolean(selected)}
        meeting={selected}
        isAdmin={isAdmin}
        isMember={isMember}
        busy={busy}
        onClose={closeDetails}
        onJoin={(id) =>
          joinM.mutate(id, {
            onSuccess: () => {
              void meetingsQ.refetch();
            },
          })
        }
        onQuit={(id) =>
          quitM.mutate(id, {
            onSuccess: () => {
              void meetingsQ.refetch();
            },
          })
        }
        onDelete={(id) => delM.mutate(id, { onSuccess: closeDetails })}
        onStatus={(id, status) => statusM.mutate({ meetingId: id, status })}
      />
    </div>
  );
}