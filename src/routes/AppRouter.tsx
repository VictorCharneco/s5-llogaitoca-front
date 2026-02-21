import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../layouts/AppShell';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import InstrumentsPage from '../pages/InstrumentsPage';
import MeetingsPage from '../pages/MeetingsPage';
import CalendarPage from '../pages/CalendarPage';
import MyReservationsPage from '../pages/MyReservationsPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="instruments" element={<InstrumentsPage />} />
        <Route path="reservations" element={<MyReservationsPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}