import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { FaCheck, FaTimes, FaFlagCheckered, FaEye, FaCalendarDay, FaEdit } from "react-icons/fa";
import AppointmentCard from "../../components/AppointmentCard";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";
import { Input, Select } from "../../components/Input";
import { useAppointments } from "../../context/AppointmentContext";
import { useClinic } from "../../context/ClinicContext";
import { getAvailableSlots } from "../../api/doctorAvailableSlots";
import type { Appointment, AvailableSlot, UiAppointmentStatus } from "../../types";

const todayISO = () => new Date().toISOString().split("T")[0];
const STATUS_OPTIONS: (UiAppointmentStatus | "All")[] = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

interface RescheduleValues {
  date: string;
  timeSlot: string;
  doctorId: string;
}

export default function AdminAppointments() {
  const {
    appointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    rescheduleAppointment,
    deleteAppointment,
  } = useAppointments();
  const { doctors } = useClinic();
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<UiAppointmentStatus | "All">("All");
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleValues, setRescheduleValues] = useState<RescheduleValues>({
    date: "",
    timeSlot: "",
    doctorId: "",
  });
  const [rescheduleError, setRescheduleError] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (dateFilter) list = list.filter((a) => a.date === dateFilter);
    if (doctorFilter !== "all") list = list.filter((a) => a.doctorId === doctorFilter);
    if (statusFilter !== "All") list = list.filter((a) => a.status === statusFilter);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, dateFilter, doctorFilter, statusFilter]);

  const openReschedule = (apt: Appointment) => {
    setRescheduleTarget(apt);
    setRescheduleValues({ date: apt.date, timeSlot: apt.timeSlot, doctorId: apt.doctorId });
    setRescheduleError("");
  };

  // Load real, live availability whenever the doctor or date changes in the
  // reschedule form (instead of a static slot list).
  useEffect(() => {
    if (!rescheduleTarget || !rescheduleValues.doctorId || !rescheduleValues.date) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    getAvailableSlots(rescheduleValues.doctorId, rescheduleValues.date)
      .then((slots) => {
        if (!cancelled) setAvailableSlots(slots || []);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rescheduleTarget, rescheduleValues.doctorId, rescheduleValues.date]);

  const handleRescheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rescheduleValues.date || !rescheduleValues.timeSlot || !rescheduleValues.doctorId) {
      setRescheduleError("Please choose a doctor, date, and time slot.");
      return;
    }
    if (!rescheduleTarget) return;
    try {
      await rescheduleAppointment(rescheduleTarget.id, {
        date: rescheduleValues.date,
        timeSlot: rescheduleValues.timeSlot,
        doctorId: rescheduleValues.doctorId,
      });
      setRescheduleTarget(null);
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : "Failed to reschedule.");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Manage Appointments</h1>
        <p className="mt-1 text-sm text-ink-500">
          {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} in this view
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-card sm:grid-cols-3">
        <Input
          id="filter-date"
          type="date"
          label="Filter by Date"
          value={dateFilter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDateFilter(e.target.value)}
        />
        <Select
          id="filter-doctor"
          label="Filter by Doctor"
          value={doctorFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setDoctorFilter(e.target.value)}
          options={[
            { value: "all", label: "All Doctors" },
            ...doctors.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <Select
          id="filter-status"
          label="Filter by Status"
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value as UiAppointmentStatus | "All")
          }
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        />
      </div>
      {dateFilter && (
        <button
          onClick={() => setDateFilter("")}
          className="mb-4 text-xs font-semibold text-primary-600 hover:underline"
        >
          Clear date filter
        </button>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FaCalendarDay}
          title="No appointments here"
          message="Nothing matches this filter right now."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              primaryLabel={`${apt.patientName} → ${apt.doctorName}`}
            >
              <button
                onClick={() => setActiveAppointment(apt)}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100"
              >
                <FaEye /> Details
              </button>
              {apt.status === "Pending" && (
                <>
                  <button
                    onClick={() => confirmAppointment(apt.id)}
                    className="flex items-center gap-1.5 rounded-full bg-mint-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-mint-600"
                  >
                    <FaCheck /> Confirm
                  </button>
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
              {apt.status === "Confirmed" && (
                <>
                  <button
                    onClick={() => openReschedule(apt)}
                    className="flex items-center gap-1.5 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    <FaEdit /> Reschedule
                  </button>
                  <button
                    onClick={() => completeAppointment(apt.id)}
                    className="flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    <FaFlagCheckered /> Complete
                  </button>
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </AppointmentCard>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!activeAppointment}
        onClose={() => setActiveAppointment(null)}
        title="Patient & Appointment Details"
      >
        {activeAppointment && (
          <div className="space-y-2.5">
            <p>
              <span className="font-semibold text-ink-800">Patient:</span>{" "}
              {activeAppointment.patientName}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Contact:</span>{" "}
              {activeAppointment.mobile || "—"} · {activeAppointment.email}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Doctor:</span>{" "}
              {activeAppointment.doctorName}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Date & Time:</span>{" "}
              {activeAppointment.date} at {activeAppointment.timeSlot}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Fee:</span> ₹{activeAppointment.fee}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Reason for visit:</span>{" "}
              {activeAppointment.problem || "—"}
            </p>
            <p>
              <span className="font-semibold text-ink-800">Status:</span>{" "}
              {activeAppointment.status}
            </p>
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  await deleteAppointment(activeAppointment.id);
                  setActiveAppointment(null);
                }}
              >
                Delete Record
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Appointment"
      >
        {rescheduleTarget && (
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <Select
              id="rs-doctor"
              label="Doctor"
              value={rescheduleValues.doctorId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setRescheduleValues((p) => ({ ...p, doctorId: e.target.value, timeSlot: "" }))
              }
              options={doctors.map((d) => ({ value: d.id, label: d.name }))}
            />
            <Input
              id="rs-date"
              type="date"
              label="New Date"
              min={todayISO()}
              value={rescheduleValues.date}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRescheduleValues((p) => ({ ...p, date: e.target.value, timeSlot: "" }))
              }
            />
            <Select
              id="rs-slot"
              label="New Time Slot"
              value={rescheduleValues.timeSlot}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setRescheduleValues((p) => ({ ...p, timeSlot: e.target.value }))
              }
              options={[
                { value: "", label: slotsLoading ? "Loading slots…" : "Select a time slot" },
                ...availableSlots
                  .filter((s) => !s.isBooked || s.time === rescheduleTarget.timeSlot)
                  .map((s) => ({ value: s.time, label: s.time })),
              ]}
            />
            {rescheduleError && (
              <p className="text-sm font-medium text-red-500">{rescheduleError}</p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => setRescheduleTarget(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
