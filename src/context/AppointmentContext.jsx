import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { appointmentsApi } from "../api/appointments.js";
import { notificationsApi } from "../api/notifications.js";
import { mapAppointment, mapNotification, toApiStatus } from "../utils/transform.js";
import { useAuth } from "./AuthContext.jsx";
import { useClinic } from "./ClinicContext.jsx";

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const { currentUser } = useAuth();
  const { doctors } = useClinic();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const doctorsById = doctors.reduce((acc, d) => ({ ...acc, [d.id]: d }), {});

  const refreshAppointments = useCallback(async () => {
    try {
      const res = await appointmentsApi.list();
      setAppointments((res.list || []).map((a) => mapAppointment(a, doctorsById)));
    } catch (err) {
      console.error("Failed to load appointments:", err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      const list = Array.isArray(res) ? res : res.list || [];
      setNotifications(list.map(mapNotification));
    } catch (err) {
      console.error("Failed to load notifications:", err.message);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    refreshAppointments();
    refreshNotifications();
  }, [currentUser, refreshAppointments, refreshNotifications]);

  const confirmAppointment = useCallback(
    async (id) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Confirmed"));
        await refreshAppointments();
        showToast("Appointment confirmed.", "success");
      } catch (err) {
        showToast(err.message || "Failed to confirm appointment.", "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const cancelAppointment = useCallback(
    async (id) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Cancelled"));
        await refreshAppointments();
        showToast("Appointment cancelled.", "info");
      } catch (err) {
        showToast(err.message || "Failed to cancel appointment.", "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const completeAppointment = useCallback(
    async (id) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Completed"));
        await refreshAppointments();
        showToast("Appointment marked as completed.", "success");
      } catch (err) {
        showToast(err.message || "Failed to complete appointment.", "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const rescheduleAppointment = useCallback(
    async (id, { date, timeSlot, doctorId }) => {
      try {
        await appointmentsApi.reschedule(id, { date, timeSlot, doctorId });
        await refreshAppointments();
        showToast("Appointment rescheduled.", "success");
      } catch (err) {
        showToast(err.message || "Failed to reschedule appointment.", "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const deleteAppointment = useCallback(
    async (id) => {
      try {
        await appointmentsApi.remove(id);
        await refreshAppointments();
        showToast("Appointment deleted.", "info");
      } catch (err) {
        showToast(err.message || "Failed to delete appointment.", "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const markNotificationsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err.message);
    }
  }, []);

  const value = {
    appointments,
    refreshAppointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    rescheduleAppointment,
    deleteAppointment,
    notifications,
    markNotificationsRead,
    toast,
    showToast,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return ctx;
}
