import { Link } from "react-router-dom";
import {
  FaUserMd, FaUsers, FaCalendarDay, FaHourglassHalf,
  FaClipboardCheck, FaBan, FaBell, FaChevronRight,
} from "react-icons/fa";
import StatCard from "../../components/StatCard.jsx";
import BarChart from "../../components/BarChart.jsx";
import AppointmentCard from "../../components/AppointmentCard.jsx";
import { useAppointments } from "../../context/AppointmentContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useClinic } from "../../context/ClinicContext.jsx";

const todayISO = () => new Date().toISOString().split("T")[0];

export default function AdminDashboard() {
  const { appointments, notifications, confirmAppointment, cancelAppointment } = useAppointments();
  const { allPatients, currentUser } = useAuth();
  const { doctors } = useClinic();

  const today = todayISO();
  const todaysAppointments = appointments.filter((a) => a.date === today && a.status !== "Cancelled");
  const pending = appointments.filter((a) => a.status === "Pending");
  const confirmed = appointments.filter((a) => a.status === "Confirmed");
  const cancelled = appointments.filter((a) => a.status === "Cancelled");
  const recentNotifications = notifications.slice(0, 5);
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const chartData = (() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("default", { month: "short" }), key: `${d.getFullYear()}-${d.getMonth()}` });
    }
    const counts = Object.fromEntries(months.map((m) => [m.key, 0]));
    appointments.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in counts) counts[key] += 1;
    });
    return months.map((m) => ({ label: m.label, value: counts[m.key] }));
  })();

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Welcome back, {currentUser.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-ink-500">Here's what's happening across the clinic today.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaUserMd} label="Total Doctors" value={doctors.length} tint="primary" />
        <StatCard icon={FaUsers} label="Total Patients" value={allPatients.length} tint="mint" />
        <StatCard icon={FaCalendarDay} label="Today's Appointments" value={todaysAppointments.length} tint="amber" />
        <StatCard icon={FaHourglassHalf} label="Pending Appointments" value={pending.length} tint="amber" />
        <StatCard icon={FaClipboardCheck} label="Confirmed Appointments" value={confirmed.length} tint="primary" />
        <StatCard icon={FaBan} label="Cancelled Appointments" value={cancelled.length} tint="red" />
        <StatCard icon={FaBell} label="Unread Notifications" value={notifications.filter((n) => !n.read).length} tint="mint" />
        <StatCard icon={FaUsers} label="Total Appointments" value={appointments.length} tint="primary" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink-900">Monthly Appointment Statistics</h2>
          <BarChart data={chartData} color="#3366FF" />
        </div>

        <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">Notifications</h2>
            <Link to="/admin/notifications" className="text-xs font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-ink-400">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentNotifications.map((n) => (
                <li key={n.id} className="border-b border-ink-100 pb-3 text-sm text-ink-600 last:border-0 last:pb-0">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-ink-900">Recent Appointments</h2>
          <Link to="/admin/appointments" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
            Manage all <FaChevronRight className="text-[10px]" />
          </Link>
        </div>
        {recentAppointments.length === 0 ? (
          <p className="text-sm text-ink-400">No appointments booked yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} primaryLabel={`${apt.patientName} → ${apt.doctorName}`}>
                {apt.status === "Pending" && (
                  <>
                    <button onClick={() => confirmAppointment(apt.id)} className="rounded-full bg-mint-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-mint-600">Confirm</button>
                    <button onClick={() => cancelAppointment(apt.id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Cancel</button>
                  </>
                )}
              </AppointmentCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
