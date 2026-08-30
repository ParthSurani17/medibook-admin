import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { departmentsApi } from "../api/departments.js";
import { doctorsApi } from "../api/doctors.js";
import { testimonialsApi } from "../api/testimonials.js";
import { mapDoctor, mapTestimonial } from "../utils/transform.js";
import { useAuth } from "./AuthContext.jsx";

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDepartments = useCallback(async () => {
    const res = await departmentsApi.list();
    setDepartments(res.list || []);
  }, []);

  const refreshDoctors = useCallback(async () => {
    const res = await doctorsApi.list();
    setDoctors((res.list || []).map(mapDoctor));
  }, []);

  const refreshTestimonials = useCallback(async () => {
    const res = await testimonialsApi.list();
    setTestimonials((res.list || []).map(mapTestimonial));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([refreshDepartments(), refreshDoctors(), refreshTestimonials()])
      .catch((err) => console.error("Failed to load clinic data:", err.message))
      .finally(() => setLoading(false));
  }, [currentUser, refreshDepartments, refreshDoctors, refreshTestimonials]);

  // ---- Departments ----
  const addDepartment = useCallback(
    async (data) => {
      const created = await departmentsApi.create(data);
      await refreshDepartments();
      return created;
    },
    [refreshDepartments]
  );
  const updateDepartment = useCallback(
    async (id, data) => {
      await departmentsApi.update(id, data);
      await refreshDepartments();
    },
    [refreshDepartments]
  );
  const deleteDepartment = useCallback(
    async (id) => {
      await departmentsApi.remove(id);
      await Promise.all([refreshDepartments(), refreshDoctors()]);
    },
    [refreshDepartments, refreshDoctors]
  );

  // ---- Doctors ----
  const addDoctor = useCallback(
    async (data) => {
      // availability is handled separately via addDoctorAvailability, since
      // the backend manages it as its own sub-resource per doctor.
      const { availability, photo, ...rest } = data;
      const created = await doctorsApi.create({ ...rest, photoUrl: photo });
      await refreshDoctors();
      return created;
    },
    [refreshDoctors]
  );
  const updateDoctor = useCallback(
    async (id, data) => {
      const { availability, photo, ...rest } = data;
      const payload = { ...rest };
      if (photo) payload.photoUrl = photo;
      await doctorsApi.update(id, payload);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const deleteDoctor = useCallback(
    async (id) => {
      await doctorsApi.remove(id);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const addDoctorAvailability = useCallback(
    async (doctorId, data) => {
      await doctorsApi.addAvailability(doctorId, data);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const removeDoctorAvailability = useCallback(
    async (availabilityId) => {
      await doctorsApi.removeAvailability(availabilityId);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const getDoctorById = useCallback((id) => doctors.find((d) => d.id === id) || null, [doctors]);
  const getDepartmentById = useCallback((id) => departments.find((d) => d.id === id) || null, [departments]);

  // ---- Testimonials ----
  const addTestimonial = useCallback(
    async (data) => {
      const created = await testimonialsApi.create(data);
      await refreshTestimonials();
      return created;
    },
    [refreshTestimonials]
  );
  const deleteTestimonial = useCallback(
    async (id) => {
      await testimonialsApi.remove(id);
      await refreshTestimonials();
    },
    [refreshTestimonials]
  );

  const value = {
    loading,
    departments, addDepartment, updateDepartment, deleteDepartment, getDepartmentById,
    doctors, addDoctor, updateDoctor, deleteDoctor, getDoctorById,
    addDoctorAvailability, removeDoctorAvailability,
    testimonials, addTestimonial, deleteTestimonial,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within a ClinicProvider");
  return ctx;
}
