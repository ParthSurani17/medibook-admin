import { useMemo } from "react";
import { FaChartBar } from "react-icons/fa";
import BarChart from "../../components/BarChart";
import EmptyState from "../../components/EmptyState";
import { useAppointments } from "../../context/AppointmentContext";
import { useClinic } from "../../context/ClinicContext";

export default function Reports() {
  const { appointments } = useAppointments();
  const { doctors, departments, getDepartmentById } = useClinic();

  const perDoctor = useMemo(
    () =>
      doctors
        .map((d) => ({ label: d.name.replace("Dr. ", ""), value: appointments.filter((a) => a.doctorId === d.id).length }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    [doctors, appointments]
  );

  const perDepartment = useMemo(
    () =>
      departments.map((dept) => {
        const doctorIds = doctors.filter((d) => d.departmentId === dept.id).map((d) => d.id);
        return { label: dept.name, value: appointments.filter((a) => doctorIds.includes(a.doctorId)).length };
      }),
    [departments, doctors, appointments]
  );

  const perWeek = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7 - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, start, end });
    }
    return weeks.map((w) => ({
      label: w.label,
      value: appointments.filter((a) => {
        const created = new Date(a.createdAt);
        return created >= w.start && created <= w.end;
      }).length,
    }));
  }, [appointments]);

  if (appointments.length === 0) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-ink-900">Reports & Analytics</h1>
        <EmptyState icon={FaChartBar} title="No data yet" message="Reports will populate once appointments start coming in." />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Reports & Analytics</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-bold text-ink-900">Appointments per Doctor</h2>
          {perDoctor.length === 0 ? <p className="text-sm text-ink-400">No doctors yet.</p> : <BarChart data={perDoctor} color="#3366FF" />}
        </div>

        <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-bold text-ink-900">Appointments per Department</h2>
          {perDepartment.length === 0 ? <p className="text-sm text-ink-400">No departments yet.</p> : <BarChart data={perDepartment} color="#1FAC79" />}
        </div>

        <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink-900">Appointments per Week (last 6 weeks)</h2>
          <BarChart data={perWeek} color="#E8A93B" />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl2 border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-bold text-ink-900">Doctor Summary</h2>
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-ink-500">
              <th className="pb-2 font-semibold">Doctor</th>
              <th className="pb-2 font-semibold">Department</th>
              <th className="pb-2 font-semibold">Total Appointments</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-b border-ink-50 last:border-0">
                <td className="py-2.5 font-medium text-ink-800">{d.name}</td>
                <td className="py-2.5 text-ink-500">{getDepartmentById(d.departmentId)?.name || "Unassigned"}</td>
                <td className="py-2.5 text-ink-500">{appointments.filter((a) => a.doctorId === d.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
