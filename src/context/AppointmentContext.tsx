import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { appointmentsApi } from "../api/appointments";
import { notificationsApi } from "../api/notifications";
import { mapAppointment, mapNotification, toApiStatus } from "../utils/transform";
import { useAuth } from "./AuthContext";
import { useClinic } from "./ClinicContext";
import type {
  AppNotification,
  Appointment,
  Doctor,
  RescheduleAppointmentPayload,
  ToastState,
  ToastType,
} from "../types";

interface AppointmentContextValue {
  appointments: Appointment[];
  refreshAppointments: () => Promise<void>;
  confirmAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, data: RescheduleAppointmentPayload) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  notifications: AppNotification[];
  markNotificationsRead: () => Promise<void>;
  toast: ToastState | null;
  showToast: (message: string, type?: ToastType) => void;
}

const AppointmentContext = createContext<AppointmentContextValue | null>(null);

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { doctors } = useClinic();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const doctorsById: Record<string, Doctor> = doctors.reduce(
    (acc, d) => ({ ...acc, [d.id]: d }),
    {} as Record<string, Doctor>
  );

  const refreshAppointments = useCallback(async () => {
    try {
      const res = await appointmentsApi.list();
      setAppointments((res.list || []).map((a) => mapAppointment(a, doctorsById)));
    } catch (err) {
      console.error("Failed to load appointments:", errorMessage(err, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      const list = Array.isArray(res) ? res : [];
      setNotifications(list.map(mapNotification));
    } catch (err) {
      console.error("Failed to load notifications:", errorMessage(err, ""));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    refreshAppointments();
    refreshNotifications();
  }, [currentUser, refreshAppointments, refreshNotifications]);

  const confirmAppointment = useCallback(
    async (id: string) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Confirmed"));
        await refreshAppointments();
        showToast("Appointment confirmed.", "success");
      } catch (err) {
        showToast(errorMessage(err, "Failed to confirm appointment."), "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const cancelAppointment = useCallback(
    async (id: string) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Cancelled"));
        await refreshAppointments();
        showToast("Appointment cancelled.", "info");
      } catch (err) {
        showToast(errorMessage(err, "Failed to cancel appointment."), "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const completeAppointment = useCallback(
    async (id: string) => {
      try {
        await appointmentsApi.updateStatus(id, toApiStatus("Completed"));
        await refreshAppointments();
        showToast("Appointment marked as completed.", "success");
      } catch (err) {
        showToast(errorMessage(err, "Failed to complete appointment."), "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const rescheduleAppointment = useCallback(
    async (id: string, { date, timeSlot, doctorId }: RescheduleAppointmentPayload) => {
      try {
        await appointmentsApi.reschedule(id, { date, timeSlot, doctorId });
        await refreshAppointments();
        showToast("Appointment rescheduled.", "success");
      } catch (err) {
        showToast(errorMessage(err, "Failed to reschedule appointment."), "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      try {
        await appointmentsApi.remove(id);
        await refreshAppointments();
        showToast("Appointment deleted.", "info");
      } catch (err) {
        showToast(errorMessage(err, "Failed to delete appointment."), "error");
      }
    },
    [refreshAppointments, showToast]
  );

  const markNotificationsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", errorMessage(err, ""));
    }
  }, []);

  const value: AppointmentContextValue = {
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
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  );
}

export function useAppointments(): AppointmentContextValue {
  const ctx = useContext(AppointmentContext);
  if (!ctx) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return ctx;
}
