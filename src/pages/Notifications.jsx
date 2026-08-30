import { useEffect } from "react";
import { FaBell, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import EmptyState from "../components/EmptyState.jsx";
import { useAppointments } from "../context/AppointmentContext.jsx";

function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Notifications() {
  // /admin/notifications is already scoped server-side to the logged-in
  // admin, so there's no client-side audience filtering needed here.
  const { notifications, markNotificationsRead } = useAppointments();

  useEffect(() => {
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={FaBell} title="No notifications yet" message="You're all caught up — new updates about appointments will appear here." />
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Notifications</h1>
      <div className="mx-auto max-w-2xl space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-card">
            <span className="mt-0.5 text-lg text-primary-500">
              {n.message.toLowerCase().includes("confirmed") || n.message.toLowerCase().includes("sent") ? <FaCheckCircle className="text-mint-500" /> : <FaInfoCircle />}
            </span>
            <div>
              <p className="text-sm text-ink-800">{n.message}</p>
              <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
