import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Toast from "../components/Toast.jsx";
import { ScrollToTopOnNavigate } from "../components/ScrollToTop.jsx";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50/60 font-body text-ink-800">
      <ScrollToTopOnNavigate />
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
