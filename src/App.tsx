import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Departments from "./pages/admin/Departments";
import Doctors from "./pages/admin/Doctors";
import DoctorDetails from "./pages/admin/DoctorDetails";
import Patients from "./pages/admin/Patients";
import AdminAppointments from "./pages/admin/AdminAppointments";
import Testimonials from "./pages/admin/Testimonials";
import Reports from "./pages/admin/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public (login / forgot password) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin panel — requires role "admin" */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/doctors" element={<Doctors />} />
          <Route path="/admin/doctors/:id" element={<DoctorDetails />} />
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
