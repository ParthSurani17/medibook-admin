import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat, FaTachometerAlt, FaCalendarCheck, FaUserMd, FaHospitalAlt,
  FaUsers, FaCommentDots, FaChartBar, FaBell, FaUserCog, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppointments } from "../context/AppointmentContext.jsx";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { to: "/admin/departments", label: "Departments", icon: FaHospitalAlt },
  { to: "/admin/doctors", label: "Doctors", icon: FaUserMd },
  { to: "/admin/patients", label: "Patients", icon: FaUsers },
  { to: "/admin/appointments", label: "Appointments", icon: FaCalendarCheck },
  { to: "/admin/testimonials", label: "Testimonials", icon: FaCommentDots },
  { to: "/admin/reports", label: "Reports", icon: FaChartBar },
  { to: "/admin/notifications", label: "Notifications", icon: FaBell },
  { to: "/admin/profile", label: "Profile", icon: FaUserCog },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { notifications, showToast } = useAppointments();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    navigate("/login");
  };

  const content = (
    <div className="flex h-full flex-col bg-ink-900 text-white">
      <Link to="/admin/dashboard" className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white">
          <FaHeartbeat />
        </span>
        <span className="font-display text-lg font-extrabold">
          Medi<span className="text-mint-400">Book</span>
        </span>
      </Link>

      <div className="px-6 pb-4 text-xs uppercase tracking-wide text-ink-400">Admin Panel</div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-primary-600 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white"
              }`
            }
          >
            <Icon className="text-base" />
            {label}
            {label === "Notifications" && unread > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-800 px-6 py-5">
        <p className="truncate text-sm font-semibold">{currentUser?.name}</p>
        <p className="truncate text-xs text-ink-400">{currentUser?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/10"
        >
          <FaSignOutAlt /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-900 px-4 py-3 text-white lg:hidden">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <FaHeartbeat />
          </span>
          <span className="font-display text-base font-extrabold">MediBook</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="text-xl">
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden">{content}</div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 lg:block">{content}</div>
    </>
  );
}
