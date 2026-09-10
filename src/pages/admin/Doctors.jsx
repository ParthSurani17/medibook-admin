import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaUserMd, FaStar, FaTimes, FaSearch } from "react-icons/fa";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { Input, Select } from "../../components/Input.jsx";
import { useClinic } from "../../context/ClinicContext.jsx";
import { useAppointments } from "../../context/AppointmentContext.jsx";
import { WEEKDAYS } from "../../data/seed.js";
import { DAY_TO_API, DAY_TO_UI } from "../../utils/transform.js";

const avatar = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b7d0ff,cdf5e3,eaf2ff`;

const emptyForm = {
  name: "", departmentId: "", qualification: "", experience: "", fee: "",
};
const emptyAvailabilityForm = { day: WEEKDAYS[0], startTime: "10:00", endTime: "13:00", slotDuration: 30 };

export default function Doctors() {
  const {
    doctors, departments, refreshDoctors, getDepartmentById,
    addDoctor, updateDoctor, deleteDoctor,
    addDoctorAvailability, removeDoctorAvailability,
  } = useClinic();
  const { showToast } = useAppointments();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState(emptyAvailabilityForm);
  const [availabilityError, setAvailabilityError] = useState("");
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshDoctors(
        search.trim()
          ? {
              searchColumn: ["name", "email", "qualification", "hospital"],
              search: search.trim(),
            }
          : undefined,
      ).catch((error) => showToast(error.message || "Failed to search doctors.", "error"));
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search, refreshDoctors, showToast]);

  const editingDoctor = editingId ? doctors.find((d) => d.id === editingId) : null;

  const openAdd = () => {
    setEditingId(null);
    setValues(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (doc) => {
    setEditingId(doc.id);
    setValues({
      name: doc.name,
      departmentId: doc.departmentId || "",
      qualification: doc.qualification || "",
      experience: doc.experience ?? "",
      fee: doc.fee ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!values.name.trim()) newErrors.name = "Please enter the doctor's name.";
    if (!values.departmentId) newErrors.departmentId = "Please select a department.";
    if (!values.qualification.trim()) newErrors.qualification = "Please enter a qualification.";
    if (!values.experience || Number(values.experience) < 0) newErrors.experience = "Enter valid years of experience.";
    if (!values.fee || Number(values.fee) <= 0) newErrors.fee = "Enter a valid consultation fee.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: values.name.trim(),
      departmentId: values.departmentId,
      qualification: values.qualification.trim(),
      experience: Number(values.experience),
      fee: Number(values.fee),
    };

    setSavingBasic(true);
    try {
      if (editingId) {
        await updateDoctor(editingId, payload);
        showToast("Doctor updated.", "success");
      } else {
        const created = await addDoctor({ ...payload, photo: avatar(values.name) });
        showToast("Doctor added — now add their weekly availability below.", "success");
        // Switch straight into edit mode for the doctor we just created so
        // the admin can add availability windows without reopening the modal.
        setEditingId(created.id);
        return;
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to save doctor.", "error");
    } finally {
      setSavingBasic(false);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setAvailabilityError("");
    if (!availabilityForm.startTime || !availabilityForm.endTime) {
      setAvailabilityError("Please set both a start and end time.");
      return;
    }
    if (availabilityForm.startTime >= availabilityForm.endTime) {
      setAvailabilityError("End time must be after start time.");
      return;
    }
    setSavingSlot(true);
    try {
      await addDoctorAvailability(editingId, {
        day: DAY_TO_API[availabilityForm.day],
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        slotDuration: Number(availabilityForm.slotDuration),
      });
      showToast("Availability window added.", "success");
      setAvailabilityForm(emptyAvailabilityForm);
    } catch (err) {
      setAvailabilityError(err.message || "Failed to add availability.");
    } finally {
      setSavingSlot(false);
    }
  };

  const handleRemoveAvailability = async (id) => {
    try {
      await removeDoctorAvailability(id);
      showToast("Availability window removed.", "info");
    } catch (err) {
      showToast(err.message || "Failed to remove availability.", "error");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage Doctors</h1>
          <p className="mt-1 text-sm text-ink-500">{doctors.length} doctor{doctors.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openAdd} icon={FaPlus} disabled={departments.length === 0}>Add Doctor</Button>
      </div>
      {departments.length === 0 && (
        <p className="mb-4 text-sm text-amber-600">Add at least one department before adding doctors.</p>
      )}

      <Input
        id="doctor-search"
        type="search"
        aria-label="Search doctors"
        placeholder="Search name, email, qualification, or hospital..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        icon={FaSearch}
        className="mb-6 max-w-md"
      />

      {doctors.length === 0 ? (
        <EmptyState icon={FaUserMd} title={search ? "No matching doctors" : "No doctors yet"} message={search ? "Try a different doctor name." : "Add your first doctor to start accepting bookings."} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => {
            const dept = getDepartmentById(doc.departmentId);
            return (
              <div
                key={doc.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/admin/doctors/${doc.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/admin/doctors/${doc.id}`);
                  }
                }}
                className="flex cursor-pointer flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    onError={(event) => { event.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#dbeafe"/><text x="48" y="59" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#2563eb">${doc.name.trim().charAt(0).toUpperCase()}</text></svg>`)}`; }}
                    className="h-14 w-14 rounded-full border-2 border-white shadow-soft"
                  />
                  <div>
                    <p className="font-bold text-ink-900">{doc.name}</p>
                    <p className="text-sm text-primary-600">{dept ? dept.name : "Unassigned"}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-ink-500">
                  <p>{doc.qualification}</p>
                  <p>{doc.experience} yrs experience &middot; ₹{doc.fee} fee</p>
                  <p className="flex items-center gap-1 text-amber-500"><FaStar /> {doc.rating}</p>
                  <p className="text-xs text-ink-400">
                    {doc.availability.length === 0
                      ? "No availability set yet"
                      : [...new Set(doc.availability.map((a) => DAY_TO_UI[a.day]))].join(", ")}
                  </p>
                </div>
                <div
                  className="mt-4 flex gap-2 border-t border-ink-100 pt-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button size="sm" variant="outline" icon={FaEdit} onClick={() => navigate(`/admin/doctors/${doc.id}?edit=1`)}>Edit</Button>
                  <Button size="sm" variant="danger" icon={FaTrash} onClick={() => setConfirmDeleteId(doc.id)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Doctor" : "Add Doctor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="doc-name" label="Doctor Name" placeholder="e.g. Dr. Jane Doe" value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} error={errors.name} />
          <Select
            id="doc-dept" label="Department" value={values.departmentId} error={errors.departmentId}
            onChange={(e) => setValues((p) => ({ ...p, departmentId: e.target.value }))}
            options={[{ value: "", label: "Select a department" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <Input id="doc-qual" label="Qualification" placeholder="e.g. MBBS, MD" value={values.qualification} onChange={(e) => setValues((p) => ({ ...p, qualification: e.target.value }))} error={errors.qualification} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="doc-exp" type="number" label="Experience (years)" value={values.experience} onChange={(e) => setValues((p) => ({ ...p, experience: e.target.value }))} error={errors.experience} />
            <Input id="doc-fee" type="number" label="Consultation Fee (₹)" value={values.fee} onChange={(e) => setValues((p) => ({ ...p, fee: e.target.value }))} error={errors.fee} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={savingBasic}>
              {savingBasic ? "Saving…" : editingId ? "Save Changes" : "Add Doctor & Continue"}
            </Button>
          </div>

          {editingId && (
            <div className="mt-2 border-t border-ink-100 pt-4">
              <p className="mb-2 text-sm font-semibold text-ink-800">Weekly Availability</p>

              {editingDoctor?.availability?.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {editingDoctor.availability.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                      <span>{DAY_TO_UI[a.day]}: {a.startTime}–{a.endTime} ({a.slotDuration} min slots)</span>
                      <button type="button" onClick={() => handleRemoveAvailability(a.id)} className="text-red-500 hover:text-red-700" aria-label="Remove">
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-ink-100 p-3 sm:grid-cols-4">
                <Select
                  id="av-day" label="Day" value={availabilityForm.day}
                  onChange={(e) => setAvailabilityForm((p) => ({ ...p, day: e.target.value }))}
                  options={WEEKDAYS.map((d) => ({ value: d, label: d.slice(0, 3) }))}
                  className="col-span-2 sm:col-span-1"
                />
                <Input id="av-start" type="time" label="Start" value={availabilityForm.startTime} onChange={(e) => setAvailabilityForm((p) => ({ ...p, startTime: e.target.value }))} />
                <Input id="av-end" type="time" label="End" value={availabilityForm.endTime} onChange={(e) => setAvailabilityForm((p) => ({ ...p, endTime: e.target.value }))} />
                <Input id="av-duration" type="number" label="Slot (min)" value={availabilityForm.slotDuration} onChange={(e) => setAvailabilityForm((p) => ({ ...p, slotDuration: e.target.value }))} />
              </div>
              {availabilityError && <p className="mt-1.5 text-xs font-medium text-red-500">{availabilityError}</p>}
              <Button type="button" size="sm" className="mt-2" onClick={handleAddAvailability} disabled={savingSlot}>
                {savingSlot ? "Adding…" : "Add Window"}
              </Button>

              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={() => setModalOpen(false)}>Done</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete this doctor?">
        <p>This will permanently remove the doctor's profile. Existing appointment records will keep their history but the doctor will no longer be bookable. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Keep it</Button>
          <Button variant="danger" onClick={async () => { await deleteDoctor(confirmDeleteId); setConfirmDeleteId(null); showToast("Doctor deleted.", "info"); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
