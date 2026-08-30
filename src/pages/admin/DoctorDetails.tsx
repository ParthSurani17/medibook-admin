import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaStar, FaCalendarAlt, FaClock, FaUserMd } from "react-icons/fa";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useClinic } from "../../context/ClinicContext";
import { useAppointments } from "../../context/AppointmentContext";
import { DAY_TO_UI } from "../../utils/transform";
import type { Doctor } from "../../types";

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctors, getDepartmentById, deleteDoctor } = useClinic();
  const { showToast } = useAppointments();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      const foundDoctor = doctors.find((d) => d.id === id);
      setDoctor(foundDoctor || null);
      setLoading(false);
    }
  }, [id, doctors]);

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
    // Navigate to doctors page and trigger edit mode
    // We'll use state to pass the edit intent
    navigate(`/admin/doctors`, { state: { editDoctorId: doctor.id } });
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