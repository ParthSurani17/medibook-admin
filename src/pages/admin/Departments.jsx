import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaHospitalAlt, FaSearch } from "react-icons/fa";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { Input, TextArea } from "../../components/Input.jsx";
import { useClinic } from "../../context/ClinicContext.jsx";
import { useAppointments } from "../../context/AppointmentContext.jsx";

const emptyForm = { name: "", description: "" };

export default function Departments() {
  const { departments, doctors, refreshDepartments, addDepartment, updateDepartment, deleteDepartment } = useClinic();
  const { showToast } = useAppointments();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshDepartments(
        search.trim()
          ? { searchColumn: ["name", "description"], search: search.trim() }
          : undefined,
      ).catch((error) => showToast(error.message || "Failed to search departments.", "error"));
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search, refreshDepartments, showToast]);

  const doctorCount = (deptId) => doctors.filter((d) => d.departmentId === deptId).length;

  const openAdd = () => {
    setEditingId(null);
    setValues(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingId(dept.id);
    setValues({ name: dept.name, description: dept.description || "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setErrors({ name: "Please enter a department name." });
      return;
    }
    if (editingId) {
      updateDepartment(editingId, values);
      showToast("Department updated.", "success");
    } else {
      addDepartment(values);
      showToast("Department added.", "success");
    }
    setModalOpen(false);
  };

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage Departments</h1>
          <p className="mt-1 text-sm text-ink-500">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openAdd} icon={FaPlus}>Add Department</Button>
      </div>

      <Input
        id="department-search"
        type="search"
        aria-label="Search departments"
        placeholder="Search department name or description..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        icon={FaSearch}
        className="mb-6 max-w-md"
      />

      {departments.length === 0 ? (
        <EmptyState icon={FaHospitalAlt} title={search ? "No matching departments" : "No departments yet"} message={search ? "Try a different department name." : "Add your first department or specialization to get started."} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-lg text-primary-600">
                  <FaHospitalAlt />
                </span>
                <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">
                  {doctorCount(dept.id)} doctor{doctorCount(dept.id) !== 1 ? "s" : ""}
                </span>
              </div>
              <h3 className="mt-4 font-bold text-ink-900">{dept.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{dept.description}</p>
              <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                <Button size="sm" variant="outline" icon={FaEdit} onClick={() => openEdit(dept)}>Edit</Button>
                <Button size="sm" variant="danger" icon={FaTrash} onClick={() => setConfirmDeleteId(dept.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="dept-name" label="Department Name" placeholder="e.g. Cardiology" value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} error={errors.name} />
          <TextArea id="dept-desc" label="Description" placeholder="Short description" rows={3} value={values.description} onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? "Save Changes" : "Add Department"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete this department?">
        <p>Doctors currently in this department will become "Unassigned" rather than deleted. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Keep it</Button>
          <Button variant="danger" onClick={() => { deleteDepartment(confirmDeleteId); setConfirmDeleteId(null); showToast("Department deleted.", "info"); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
