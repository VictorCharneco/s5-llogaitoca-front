import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { useMyReservations } from '../hooks/useReservations';
import { useMyMeetings } from '../hooks/useMeetings';

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
  extendedProps?: Record<string, unknown>;
};

function toISODate(date: string) {
  // backend already provides YYYY-MM-DD; keep as is
  return date;
}

function addOneDay(yyyy_mm_dd: string) {
  // FullCalendar end for allDay events is exclusive, so add +1 day
  const [y, m, d] = yyyy_mm_dd.split('-').map((n) => Number(n));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export default function CalendarPage() {
  const reservationsQ = useMyReservations();
  const meetingsQ = useMyMeetings();

  const isLoading = reservationsQ.isLoading || meetingsQ.isLoading;
  const isError = reservationsQ.isError || meetingsQ.isError;

  const events = useMemo<FcEvent[]>(() => {
    const res = reservationsQ.data ?? [];
    const meets = meetingsQ.data ?? [];

    const reservationEvents: FcEvent[] = res.map((r) => {
      const start = toISODate(r.start_date);
      const endExclusive = addOneDay(toISODate(r.end_date));

      return {
        id: `res-${r.id}`,
        title: `🎸 ${r.instrument.name}`,
        start,
        end: endExclusive,
        allDay: true,
        backgroundColor: 'rgba(212,168,71,0.18)',
        borderColor: 'rgba(212,168,71,0.35)',
        textColor: 'rgba(255,255,255,0.92)',
        extendedProps: {
          kind: 'reservation',
          reservationId: r.id,
          instrumentId: r.instrument.id,
          status: r.status,
        },
      };
    });

    const meetingEvents: FcEvent[] = meets.map((m) => {
      // Meeting has day + start_time/end_time ("HH:MM:SS")
      const start = `${m.day}T${m.start_time}`;
      const end = `${m.day}T${m.end_time}`;

      return {
        id: `meet-${m.id}`,
        title: `👥 ${m.room}`,
        start,
        end,
        allDay: false,
        backgroundColor: 'rgba(91,163,217,0.18)',
        borderColor: 'rgba(91,163,217,0.35)',
        textColor: 'rgba(255,255,255,0.92)',
        extendedProps: {
          kind: 'meeting',
          meetingId: m.id,
          room: m.room,
          status: m.status,
          usersCount: m.users_count,
        },
      };
    });

    return [...reservationEvents, ...meetingEvents];
  }, [reservationsQ.data, meetingsQ.data]);

  const onDateClick = (arg: DateClickArg) => {
    // Por ahora solo lectura (más adelante: abrir modal crear meeting/reserva)
    console.log('dateClick', arg.dateStr);
  };

  const onEventClick = (arg: EventClickArg) => {
    // Por ahora solo lectura (más adelante: abrir detalle + acciones)
    console.log('eventClick', arg.event.id, arg.event.extendedProps);
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
          <div className={styles.iconWrap} style={{ background: 'rgba(157,109,232,0.10)' }} aria-hidden="true">
            <span style={{ color: '#9d6de8', fontSize: 22, fontWeight: 900 }}>📅</span>
          </div>
          <p className={styles.eyebrow} style={{ color: '#9d6de8' }}>
            Schedule
          </p>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.sub}>
            Your reservations (all-day) + your meetings (time slots).
          </p>
        </div>
      </section>

      <section className={styles.placeholder} style={{ paddingTop: 18 }}>
        {isLoading && <div style={{ opacity: 0.85 }}>Loading calendar…</div>}

        {isError && (
          <div style={{ opacity: 0.9 }}>
            Couldn’t load calendar data.
            <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
              {reservationsQ.error instanceof Error ? reservationsQ.error.message : ''}
              {meetingsQ.error instanceof Error ? ` ${meetingsQ.error.message}` : ''}
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
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              events={events}
              dateClick={onDateClick}
              eventClick={onEventClick}
              nowIndicator
              weekNumbers={false}
              dayMaxEvents={3}
            />
          </div>
        )}
      </section>
    </div>
  );
}