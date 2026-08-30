import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { ScrollToTopOnNavigate } from "../components/ScrollToTop";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50/60 font-body text-ink-800">
      <ScrollToTopOnNavigate />
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
