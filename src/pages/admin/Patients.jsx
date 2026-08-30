import { useMemo, useState } from "react";
import { FaUsers, FaEye, FaBan, FaCheckCircle } from "react-icons/fa";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAppointments } from "../../context/AppointmentContext.jsx";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600",
  Confirmed: "bg-mint-50 text-mint-700",
  Completed: "bg-primary-50 text-primary-700",
  Cancelled: "bg-red-50 text-red-600",
};

export default function Patients() {
  const { allPatients, setPatientBlocked } = useAuth();
  const { appointments, showToast } = useAppointments();
  const [query, setQuery] = useState("");
  const [activePatient, setActivePatient] = useState(null);

  const filtered = useMemo(() => {
    if (!query) return allPatients;
    const q = query.toLowerCase();
    return allPatients.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [allPatients, query]);

  const historyFor = (patientId) =>
    [...appointments].filter((a) => a.patientId === patientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const toggleBlock = (patient) => {
    setPatientBlocked(patient.id, !patient.blocked);
    showToast(patient.blocked ? "Patient unblocked." : "Patient blocked.", patient.blocked ? "success" : "info");
    setActivePatient((prev) => (prev && prev.id === patient.id ? { ...prev, blocked: !patient.blocked } : prev));
  };

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage Patients</h1>
          <p className="mt-1 text-sm text-ink-500">{allPatients.length} registered patient{allPatients.length !== 1 ? "s" : ""}</p>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name or email..." className="sm:w-80" />
      </div>

      {allPatients.length === 0 ? (
        <EmptyState icon={FaUsers} title="No patients yet" message="Patients who register through the booking site will appear here." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" message="No patients match your search." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-ink-900">{p.name}</p>
                  <p className="text-sm text-ink-500">{p.email}</p>
                  <p className="text-sm text-ink-500">{p.phone || "No phone on file"}</p>
                </div>
                {p.blocked && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Blocked</span>
                )}
              </div>
              <p className="mt-3 text-xs text-ink-400">{historyFor(p.id).length} appointment{historyFor(p.id).length !== 1 ? "s" : ""} on record</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                <Button size="sm" variant="ghost" icon={FaEye} onClick={() => setActivePatient(p)}>View</Button>
                <Button
                  size="sm"
                  variant={p.blocked ? "outline" : "danger"}
                  icon={p.blocked ? FaCheckCircle : FaBan}
                  onClick={() => toggleBlock(p)}
                >
                  {p.blocked ? "Unblock" : "Block"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!activePatient} onClose={() => setActivePatient(null)} title="Patient Details">
        {activePatient && (
          <div>
            <p><span className="font-semibold text-ink-800">Name:</span> {activePatient.name}</p>
            <p><span className="font-semibold text-ink-800">Email:</span> {activePatient.email}</p>
            <p><span className="font-semibold text-ink-800">Phone:</span> {activePatient.phone || "—"}</p>
            <p><span className="font-semibold text-ink-800">Status:</span> {activePatient.blocked ? "Blocked" : "Active"}</p>

            <h4 className="mb-2 mt-4 font-semibold text-ink-800">Appointment History</h4>
            {historyFor(activePatient.id).length === 0 ? (
              <p className="text-sm text-ink-400">No appointments yet.</p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {historyFor(activePatient.id).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-ink-800">{a.doctorName}</p>
                      <p className="text-xs text-ink-500">{a.date} at {a.timeSlot}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[a.status] || "bg-ink-100 text-ink-600"}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <Button variant={activePatient.blocked ? "outline" : "danger"} icon={activePatient.blocked ? FaCheckCircle : FaBan} onClick={() => toggleBlock(activePatient)}>
                {activePatient.blocked ? "Unblock Patient" : "Block Patient"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
