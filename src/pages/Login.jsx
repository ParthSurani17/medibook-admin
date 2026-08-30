import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeartbeat, FaSignInAlt } from "react-icons/fa";
import { Input } from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppointments } from "../context/AppointmentContext.jsx";
import { validateLoginForm } from "../utils/validators.js";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useAppointments();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(values);
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length > 0) return;

    const result = await login(values);
    if (!result.success) {
      setFormError(result.message);
      return;
    }
    showToast("Logged in successfully!", "success");
    navigate(redirectTo || "/admin/dashboard", { replace: true });
  };

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-xl2 border border-ink-100 bg-white p-8 shadow-card animate-fadeUp">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl text-white shadow-soft">
            <FaHeartbeat />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Admin Login</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage doctors, departments, patients and appointments.</p>
        </div>

        {redirectTo && !formError && (
          <div className="mt-5 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
            Please log in to continue — you'll be taken right back to what you were doing.
          </div>
        )}

        {formError && (
          <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Input id="login-email" type="email" label="Email" placeholder="you@example.com" value={values.email} onChange={handleChange("email")} error={errors.email} />
          <Input id="login-password" type="password" label="Password" placeholder="Your password" value={values.password} onChange={handleChange("password")} error={errors.password} />
          <div className="-mt-2 text-right">
            <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" icon={FaSignInAlt} className="w-full">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Demo login: admin@medibook.demo / Admin@123 (or whatever ADMIN_EMAIL/ADMIN_PASSWORD you seeded the backend with)
        </p>
      </div>
    </div>
  );
}
