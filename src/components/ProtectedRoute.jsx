import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role }) {
  const { currentUser, authLoading, logout } = useAuth();
  const location = useLocation();
  const wrongRole = !!(role && currentUser && currentUser.role !== role);

  useEffect(() => {
    if (wrongRole) logout();
  }, [wrongRole, logout]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">
        Loading…
      </div>
    );
  }

  if (!currentUser || wrongRole) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}
