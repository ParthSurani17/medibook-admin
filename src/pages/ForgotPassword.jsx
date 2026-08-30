import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaKey, FaCheckCircle, FaArrowLeft, FaEnvelopeOpenText } from "react-icons/fa";
import { Input } from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppointments } from "../context/AppointmentContext.jsx";
import { isValidEmail, isValidPassword } from "../utils/validators.js";

export default function ForgotPassword() {
  const { requestPasswordReset, resetPasswordWithToken } = useAuth();
  const { showToast } = useAppointments();
  const navigate = useNavigate();

  // "email" -> "resetForm" (paste token from email + choose new password) -> "done"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [values, setValues] = useState({ token: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setEmailSubmitting(true);
    const result = await requestPasswordReset(email);
    setEmailSubmitting(false);
    if (!result.success) {
      setEmailError(result.message);
      return;
    }
    setStep("resetForm");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!values.token.trim()) newErrors.token = "Paste the token from the reset email.";
    if (!isValidPassword(values.newPassword)) newErrors.newPassword = "Password must be at least 6 characters.";
    if (values.confirmPassword !== values.newPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    const result = await resetPasswordWithToken(values.token.trim(), values.newPassword);
    setSubmitting(false);
    if (!result.success) {
      setErrors({ token: result.message });
      return;
    }
    setStep("done");
    showToast("Password reset successfully!", "success");
  };

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-xl2 border border-ink-100 bg-white p-8 shadow-card animate-fadeUp">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl text-white shadow-soft">
            {step === "done" ? <FaCheckCircle /> : step === "resetForm" ? <FaEnvelopeOpenText /> : <FaKey />}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">
            {step === "email" && "Reset your password"}
            {step === "resetForm" && "Check your email"}
            {step === "done" && "Password updated"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {step === "email" && "Enter the email linked to your account."}
            {step === "resetForm" &&
              `We sent a reset link to ${email}. Paste the token from that email below along with your new password. (In dev without SMTP configured, check the backend server console — the email is logged there instead of sent.)`}
            {step === "done" && "You can now log in with your new password."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-5">
            <Input id="forgot-email" type="email" label="Email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
            <Button type="submit" size="lg" className="w-full" disabled={emailSubmitting}>
              {emailSubmitting ? "Sending…" : "Continue"}
            </Button>
          </form>
        )}

        {step === "resetForm" && (
          <form onSubmit={handleResetSubmit} className="mt-6 space-y-5">
            <Input
              id="reset-token" label="Reset Token" placeholder="Paste the token from the email"
              value={values.token} onChange={(e) => setValues((p) => ({ ...p, token: e.target.value }))} error={errors.token}
            />
            <Input id="new-password" type="password" label="New Password" placeholder="At least 6 characters" value={values.newPassword} onChange={(e) => setValues((p) => ({ ...p, newPassword: e.target.value }))} error={errors.newPassword} />
            <Input id="confirm-new-password" type="password" label="Confirm New Password" placeholder="Re-enter new password" value={values.confirmPassword} onChange={(e) => setValues((p) => ({ ...p, confirmPassword: e.target.value }))} error={errors.confirmPassword} />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Resetting…" : "Reset Password"}
            </Button>
          </form>
        )}

        {step === "done" && (
          <Button onClick={() => navigate("/login")} size="lg" className="mt-6 w-full">Go to Log In</Button>
        )}

        {step !== "done" && (
          <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-ink-500 hover:text-primary-600">
            <FaArrowLeft className="text-xs" /> Back to log in
          </Link>
        )}
      </div>
    </div>
  );
}
