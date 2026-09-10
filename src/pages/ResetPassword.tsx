import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import { Input } from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPasswordWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token.trim() || newPassword.length < 6 || newPassword !== confirmPassword) {
      setError("Enter the reset token and matching passwords of at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const result = await resetPasswordWithToken(token.trim(), newPassword);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || "Password reset failed.");
      return;
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl2 border border-ink-100 bg-white p-8 shadow-card">
        <div className="text-center"><FaKey className="mx-auto text-3xl text-primary-600" /><h1 className="mt-3 text-2xl font-bold text-ink-900">Choose a new password</h1></div>
        <Input id="reset-token" label="Reset Token" value={token} onChange={(event: ChangeEvent<HTMLInputElement>) => setToken(event.target.value)} />
        <Input id="new-password" type="password" label="New Password" value={newPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)} />
        <Input id="confirm-password" type="password" label="Confirm Password" value={confirmPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)} error={error} />
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>{submitting ? "Resetting..." : "Reset Password"}</Button>
        <Link to="/login" className="block text-center text-sm text-primary-600">Back to log in</Link>
      </form>
    </div>
  );
}
