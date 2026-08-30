import type { ReactNode } from "react";
import { FaCalendarAlt, FaClock, FaUser, FaRupeeSign } from "react-icons/fa";
import type { Appointment, UiAppointmentStatus } from "../types";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600",
  Confirmed: "bg-mint-50 text-mint-700",
  Completed: "bg-primary-50 text-primary-700",
  Cancelled: "bg-red-50 text-red-600",
  Rejected: "bg-red-50 text-red-600",
};

interface AppointmentCardProps {
  appointment: Appointment;
  primaryLabel?: string;
  children?: ReactNode;
}

export default function AppointmentCard({
  appointment,
  primaryLabel,
  children,
}: AppointmentCardProps) {
  return (
    <div className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold text-ink-900">
            <FaUser className="text-primary-500" /> {primaryLabel || appointment.patientName}
          </p>
          <p className="mt-1 text-sm text-ink-500">{appointment.problem}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[appointment.status as UiAppointmentStatus] || "bg-ink-100 text-ink-600"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-ink-500 sm:grid-cols-3">
        <p className="flex items-center gap-2">
          <FaCalendarAlt className="text-mint-500" /> {appointment.date}
        </p>
        <p className="flex items-center gap-2">
          <FaClock className="text-mint-500" /> {appointment.timeSlot}
        </p>
        <p className="flex items-center gap-2">
          <FaRupeeSign className="text-mint-500" /> {appointment.fee}
        </p>
      </div>

      {children && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">{children}</div>
      )}
    </div>
  );
}
