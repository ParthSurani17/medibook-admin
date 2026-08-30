import { Outlet, Link } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import Toast from "../components/Toast";
import { ScrollToTopOnNavigate } from "../components/ScrollToTop";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-white to-white font-body text-ink-800">
      <ScrollToTopOnNavigate />
      <header className="container-x py-6">
        <Link to="/login" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
            <FaHeartbeat />
          </span>
          <span className="font-display text-xl font-extrabold text-ink-900">
            Medi<span className="text-primary-600">Book</span>{" "}
            <span className="text-sm font-semibold text-ink-400">Admin Panel</span>
          </span>
        </Link>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
