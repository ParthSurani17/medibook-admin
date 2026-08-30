import { useState, type ChangeEvent, type FormEvent } from "react";
import { FaUserCircle, FaSave } from "react-icons/fa";
import { Input } from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useAppointments } from "../context/AppointmentContext";
import { validateProfileForm, type FormErrors, type ProfileFormValues } from "../utils/validators";

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useAppointments();

  const [values, setValues] = useState<ProfileFormValues>({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ProtectedRoute guarantees currentUser is set before this page renders,
  // but TypeScript can't see across that boundary — guard the render here
  // (after the hooks, so hook call order stays consistent).
  if (!currentUser) return null;

  const handleChange =
    (field: keyof ProfileFormValues) => (e: ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProfileForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const result = await updateProfile(values);
    setSubmitting(false);
    if (!result.success) {
      showToast(result.message || "Failed to update profile.", "error");
      return;
    }
    showToast("Profile updated successfully!", "success");
  };

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl text-primary-500">
            <FaUserCircle />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Edit Profile</h1>
          <p className="mt-1 text-sm text-ink-500">Update your admin account details.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
          <Input id="profile-name" label="Full Name" value={values.name} onChange={handleChange("name")} error={errors.name} />
          <Input id="profile-email" type="email" label="Email" value={values.email} disabled className="opacity-60" />
          <p className="-mt-3 text-xs text-ink-400">Email can't be changed here — it's your login identifier.</p>
          <Input id="profile-phone" label="Phone Number" placeholder="10-digit mobile number" value={values.phone} onChange={handleChange("phone")} error={errors.phone} />
          <Button type="submit" size="lg" icon={FaSave} className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
