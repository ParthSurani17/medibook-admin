import { FaCheckCircle, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";
import { useAppointments } from "../context/AppointmentContext.jsx";

const ICONS = {
  success: <FaCheckCircle className="text-mint-500" />,
  info: <FaInfoCircle className="text-primary-500" />,
  error: <FaExclamationCircle className="text-red-500" />,
};

export default function Toast() {
  const { toast } = useAppointments();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-800 shadow-lift animate-fadeUp"
    >
      {ICONS[toast.type] || ICONS.success}
      {toast.message}
    </div>
  );
}
