import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Departments from "./pages/admin/Departments.jsx";
import Doctors from "./pages/admin/Doctors.jsx";
import Patients from "./pages/admin/Patients.jsx";
import AdminAppointments from "./pages/admin/AdminAppointments.jsx";
import Testimonials from "./pages/admin/Testimonials.jsx";
import Reports from "./pages/admin/Reports.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public (login / forgot password) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin panel — requires role "admin" */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/doctors" element={<Doctors />} />
          <Route path="/admin/patients" element={<Patients />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/testimonials" element={<Testimonials />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
