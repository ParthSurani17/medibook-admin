import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaStar, FaCalendarAlt, FaClock, FaUserMd, FaEnvelope, FaTimes } from "react-icons/fa";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Input, Select } from "../../components/Input";
import { useClinic } from "../../context/ClinicContext";
import { useAppointments } from "../../context/AppointmentContext";
import { DAY_TO_API, DAY_TO_UI } from "../../utils/transform";
import { WEEKDAYS } from "../../data/seed";
import { uploadDoctorPhoto } from "../../api/doctors";
import type { Doctor } from "../../types";

const fallbackAvatar = (name: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#dbeafe"/><text x="48" y="59" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#2563eb">${name.trim().charAt(0).toUpperCase() || "D"}</text></svg>`,
  )}`;

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { doctors, departments, getDepartmentById, deleteDoctor, updateDoctor, addDoctorAvailability, removeDoctorAvailability } = useClinic();
  const { showToast } = useAppointments();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [values, setValues] = useState({
    name: "", email: "", departmentId: "", qualification: "", hospital: "", photo: "", experience: "", fee: "",
  });
  const [slot, setSlot] = useState({ day: WEEKDAYS[0], startTime: "10:00", endTime: "13:00", slotDuration: "30" });
  const [slotSaving, setSlotSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const foundDoctor = doctors.find((d) => d.id === id);
      setDoctor(foundDoctor || null);
      if (foundDoctor) {
        setValues({
          name: foundDoctor.name,
          email: foundDoctor.email || "",
          departmentId: foundDoctor.departmentId,
          qualification: foundDoctor.qualification || "",
          hospital: foundDoctor.hospital || "",
          photo: foundDoctor.photo || "",
          experience: String(foundDoctor.experience ?? ""),
          fee: String(foundDoctor.fee ?? ""),
        });
      }
      setIsEditing(searchParams.get("edit") === "1");
      setLoading(false);
    }
  }, [id, doctors, searchParams]);

  const handleDelete = async () => {
    if (!doctor) return;
    try {
      await deleteDoctor(doctor.id);
      showToast("Doctor deleted successfully", "success");
      navigate("/admin/doctors");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete doctor", "error");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      if (!doctor) return;
      const uploaded = await uploadDoctorPhoto(doctor.id, file);
      setValues((current) => ({ ...current, photo: uploaded.url }));
      setDoctor((current) => (current ? { ...current, photo: uploaded.url } : current));
      showToast("Doctor photo uploaded.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Photo upload failed.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!doctor || !values.name.trim() || !values.departmentId || !values.qualification.trim() || !values.experience || !values.fee) {
      showToast("Complete all required doctor fields.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateDoctor(doctor.id, {
        name: values.name.trim(),
        email: values.email.trim() || undefined,
        departmentId: values.departmentId,
        qualification: values.qualification.trim(),
        hospital: values.hospital.trim() || undefined,
        experience: Number(values.experience),
        fee: Number(values.fee),
        photo: values.photo || undefined,
      });
      setIsEditing(false);
      navigate(`/admin/doctors/${doctor.id}`, { replace: true });
      showToast("Doctor updated.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to update doctor.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = async () => {
    if (!doctor || slot.startTime >= slot.endTime) {
      showToast("End time must be after start time.", "error");
      return;
    }
    setSlotSaving(true);
    try {
      await addDoctorAvailability(doctor.id, {
        day: DAY_TO_API[slot.day as keyof typeof DAY_TO_API],
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDuration: Number(slot.slotDuration),
      });
      showToast("Availability slot added.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to add slot.", "error");
    } finally {
      setSlotSaving(false);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      await removeDoctorAvailability(slotId);
      showToast("Availability slot removed.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to remove slot.", "error");
    }
  };

  if (loading) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-ink-500">Loading doctor details...</div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <FaUserMd className="mb-4 text-4xl text-ink-300" />
          <h2 className="text-xl font-semibold text-ink-900">Doctor not found</h2>
          <p className="mt-2 text-ink-500">The doctor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin/doctors")} className="mt-4">
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  const department = getDepartmentById(doctor.departmentId);

  if (isEditing) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" icon={FaArrowLeft} onClick={() => setIsEditing(false)}>Cancel</Button>
          <h1 className="text-2xl font-bold text-ink-900">Edit Doctor</h1>
        </div>
        <form onSubmit={handleSave} className="grid w-full max-w-6xl gap-8 rounded-xl2 border border-ink-100 bg-white p-6 shadow-card lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={values.photo || doctor.photo || fallbackAvatar(doctor.name)}
              alt="Doctor preview"
              onError={(event) => { event.currentTarget.src = fallbackAvatar(doctor.name); }}
              className="h-20 w-20 rounded-full object-cover shadow-soft"
            />
            <div className="flex-1">
              <label htmlFor="doctor-photo" className="mb-1.5 block text-sm font-medium text-ink-700">Doctor photo</label>
              <div className="flex items-center gap-3">
                <input id="doctor-photo" type="file" accept="image/*" disabled={uploadingPhoto} onChange={(event: ChangeEvent<HTMLInputElement>) => handlePhotoUpload(event.target.files?.[0])} className="sr-only" />
                <label htmlFor="doctor-photo" className="cursor-pointer rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">{uploadingPhoto ? "Uploading..." : "Choose image"}</label>
                <span className="text-xs text-ink-500">JPG, PNG, or WEBP</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="doctor-name" label="Doctor name" value={values.name} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, name: event.target.value }))} />
            <Input id="doctor-email" type="email" label="Email" value={values.email} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, email: event.target.value }))} />
            <Select id="doctor-department" label="Department" value={values.departmentId} onChange={(event: ChangeEvent<HTMLSelectElement>) => setValues((current) => ({ ...current, departmentId: event.target.value }))} options={departments.map((item) => ({ value: item.id, label: item.name }))} />
            <Input id="doctor-hospital" label="Hospital / clinic" value={values.hospital} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, hospital: event.target.value }))} />
            <Input id="doctor-qualification" label="Qualification" value={values.qualification} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, qualification: event.target.value }))} />
            <Input id="doctor-experience" type="number" min="0" label="Experience (years)" value={values.experience} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, experience: event.target.value }))} />
            <Input id="doctor-fee" type="number" min="0" label="Consultation fee" value={values.fee} onChange={(event: ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, fee: event.target.value }))} />
          </div>
          </div>
          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-3 text-lg font-semibold text-ink-900">Weekly availability</h2>
            <div className="mb-3 space-y-2">
              {doctor.availability.length === 0 && <p className="text-sm text-ink-500">No slots added yet.</p>}
              {doctor.availability.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                  <span>{DAY_TO_UI[item.day]}: {item.startTime} – {item.endTime} ({item.slotDuration} min)</span>
                  <button type="button" onClick={() => handleRemoveSlot(item.id)} className="text-red-500 hover:text-red-700" aria-label="Remove availability"><FaTimes /></button>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Select id="slot-day" label="Day" value={slot.day} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSlot((current) => ({ ...current, day: event.target.value }))} options={WEEKDAYS.map((day) => ({ value: day, label: day }))} />
              <Input id="slot-start" type="time" label="Start" value={slot.startTime} onChange={(event: ChangeEvent<HTMLInputElement>) => setSlot((current) => ({ ...current, startTime: event.target.value }))} />
              <Input id="slot-end" type="time" label="End" value={slot.endTime} onChange={(event: ChangeEvent<HTMLInputElement>) => setSlot((current) => ({ ...current, endTime: event.target.value }))} />
              <Input id="slot-duration" type="number" min="5" label="Minutes" value={slot.slotDuration} onChange={(event: ChangeEvent<HTMLInputElement>) => setSlot((current) => ({ ...current, slotDuration: event.target.value }))} />
            </div>
            <Button type="button" size="sm" className="mt-3" onClick={handleAddSlot} disabled={slotSaving}>{slotSaving ? "Adding..." : "Add availability slot"}</Button>
          </div>
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-5 lg:col-span-2"><Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button><Button type="submit" disabled={saving || uploadingPhoto}>{saving ? "Saving..." : "Save Changes"}</Button></div>
        </form>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          icon={FaArrowLeft}
          onClick={() => navigate("/admin/doctors")}
        >
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-ink-900">Doctor Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FaEdit} onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="danger" icon={FaTrash} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Doctor Profile Card */}
      <div className="mb-6 rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex-shrink-0">
            <img
              src={doctor.photo}
              alt={doctor.name}
              onError={(event) => { event.currentTarget.src = fallbackAvatar(doctor.name); }}
              className="h-32 w-32 rounded-full border-4 border-white shadow-soft"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-ink-900">{doctor.name}</h2>
            <p className="mt-1 text-lg text-primary-600">{department?.name || "Unassigned Department"}</p>
            
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-ink-500">Qualification</p>
                <p className="text-base font-semibold text-ink-900">{doctor.qualification}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Email</p>
                <p className="flex items-center gap-2 text-base font-semibold text-ink-900">
                  <FaEnvelope className="text-primary-500" /> {doctor.email || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Experience</p>
                <p className="text-base font-semibold text-ink-900">{doctor.experience} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Consultation Fee</p>
                <p className="text-base font-semibold text-ink-900">₹{doctor.fee}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Rating</p>
                <p className="flex items-center gap-1 text-base font-semibold text-ink-900">
                  <FaStar className="text-amber-500" /> {doctor.rating}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Schedule */}
      <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-primary-600" />
          <h3 className="text-lg font-semibold text-ink-900">Weekly Availability</h3>
        </div>

        {doctor.availability.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-ink-500">
            <FaClock className="mb-2 text-3xl text-ink-300" />
            <p>No availability schedule set</p>
            <p className="text-sm">Add availability windows to enable booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctor.availability.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                      {DAY_TO_UI[slot.day]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">
                      {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="text-sm text-ink-500">
                      Slot duration: {slot.slotDuration} minutes
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this doctor?"
      >
        <p>
          This will permanently remove {doctor.name}'s profile. Existing appointment
          records will keep their history but the doctor will no longer be bookable.
          This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
