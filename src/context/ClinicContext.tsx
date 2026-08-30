import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { departmentsApi, type CreateDepartmentPayload } from "../api/departments";
import { doctorsApi, type CreateAvailabilityPayload } from "../api/doctors";
import { testimonialsApi } from "../api/testimonials";
import { mapDoctor, mapTestimonial } from "../utils/transform";
import { useAuth } from "./AuthContext";
import type {
  CreateDoctorPayload,
  CreateTestimonialPayload,
  Department,
  Doctor,
  RawTestimonial,
  Testimonial,
} from "../types";

// Form values coming from Doctors.tsx include `availability`/`photo` fields
// that don't map 1:1 onto the create/update API payload (availability is a
// separate sub-resource; `photo` -> `photoUrl`).
type DoctorFormValues = Omit<CreateDoctorPayload, "photo"> & { photo?: string; availability?: unknown };

interface ClinicContextValue {
  loading: boolean;
  departments: Department[];
  addDepartment: (data: CreateDepartmentPayload) => Promise<Department>;
  updateDepartment: (id: string, data: Partial<CreateDepartmentPayload>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  getDepartmentById: (id: string) => Department | null;
  doctors: Doctor[];
  addDoctor: (data: DoctorFormValues) => Promise<{ id: string }>;
  updateDoctor: (id: string, data: Partial<DoctorFormValues>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  getDoctorById: (id: string) => Doctor | null;
  addDoctorAvailability: (doctorId: string, data: CreateAvailabilityPayload) => Promise<void>;
  removeDoctorAvailability: (availabilityId: string) => Promise<void>;
  testimonials: Testimonial[];
  addTestimonial: (data: CreateTestimonialPayload) => Promise<RawTestimonial>;
  deleteTestimonial: (id: string) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
      .catch((err) => console.error("Failed to load clinic data:", errorMessage(err)))
      .finally(() => setLoading(false));
  }, [currentUser, refreshDepartments, refreshDoctors, refreshTestimonials]);

  // ---- Departments ----
  const addDepartment = useCallback(
    async (data: CreateDepartmentPayload) => {
      const created = await departmentsApi.create(data);
      await refreshDepartments();
      return created;
    },
    [refreshDepartments]
  );
  const updateDepartment = useCallback(
    async (id: string, data: Partial<CreateDepartmentPayload>) => {
      await departmentsApi.update(id, data);
      await refreshDepartments();
    },
    [refreshDepartments]
  );
  const deleteDepartment = useCallback(
    async (id: string) => {
      await departmentsApi.remove(id);
      await Promise.all([refreshDepartments(), refreshDoctors()]);
    },
    [refreshDepartments, refreshDoctors]
  );

  // ---- Doctors ----
  const addDoctor = useCallback(
    async (data: DoctorFormValues) => {
      // availability is handled separately via addDoctorAvailability, since
      // the backend manages it as its own sub-resource per doctor.
      const { availability: _availability, photo, ...rest } = data;
      const created = await doctorsApi.create({ ...rest, photoUrl: photo } as CreateDoctorPayload);
      await refreshDoctors();
      return created;
    },
    [refreshDoctors]
  );
  const updateDoctor = useCallback(
    async (id: string, data: Partial<DoctorFormValues>) => {
      const { availability: _availability, photo, ...rest } = data;
      const payload: Record<string, unknown> = { ...rest };
      if (photo) payload.photoUrl = photo;
      await doctorsApi.update(id, payload);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const deleteDoctor = useCallback(
    async (id: string) => {
      await doctorsApi.remove(id);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const addDoctorAvailability = useCallback(
    async (doctorId: string, data: CreateAvailabilityPayload) => {
      await doctorsApi.addAvailability(doctorId, data);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const removeDoctorAvailability = useCallback(
    async (availabilityId: string) => {
      await doctorsApi.removeAvailability(availabilityId);
      await refreshDoctors();
    },
    [refreshDoctors]
  );
  const getDoctorById = useCallback(
    (id: string) => doctors.find((d) => d.id === id) || null,
    [doctors]
  );
  const getDepartmentById = useCallback(
    (id: string) => departments.find((d) => d.id === id) || null,
    [departments]
  );

  // ---- Testimonials ----
  const addTestimonial = useCallback(
    async (data: CreateTestimonialPayload) => {
      const created = await testimonialsApi.create(data);
      await refreshTestimonials();
      return created;
    },
    [refreshTestimonials]
  );
  const deleteTestimonial = useCallback(
    async (id: string) => {
      await testimonialsApi.remove(id);
      await refreshTestimonials();
    },
    [refreshTestimonials]
  );

  const value: ClinicContextValue = {
    loading,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorById,
    addDoctorAvailability,
    removeDoctorAvailability,
    testimonials,
    addTestimonial,
    deleteTestimonial,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within a ClinicProvider");
  return ctx;
}
