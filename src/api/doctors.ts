import { http } from "./http";
import { getToken } from "./http";
import type {
  CreateDoctorPayload,
  DoctorAvailabilityWindow,
  PaginatedList,
  RawDoctor,
} from "../types";

export interface CreateAvailabilityPayload {
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export const doctorsApi = {
  list: () => http.get<PaginatedList<RawDoctor>>("/admin/doctors?take=100"),
  getOne: (id: string) => http.get<RawDoctor>(`/admin/doctors/${id}`),
  create: (data: CreateDoctorPayload) => http.post<RawDoctor>("/admin/doctors", data),
  update: (id: string, data: Partial<CreateDoctorPayload>) =>
    http.patch<RawDoctor>(`/admin/doctors/${id}`, data),
  remove: (id: string) => http.delete(`/admin/doctors/${id}`),
  listAvailability: (doctorId: string) =>
    http.get<DoctorAvailabilityWindow[]>(`/admin/doctors/${doctorId}/availability`),
  addAvailability: (doctorId: string, data: CreateAvailabilityPayload) =>
    http.post<DoctorAvailabilityWindow>(`/admin/doctors/${doctorId}/availability`, data),
  removeAvailability: (availabilityId: string) =>
    http.delete(`/admin/doctors/availability/${availabilityId}`),
};

export async function uploadDoctorPhoto(doctorId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/admin/doctors/${doctorId}/photo`,
    {
      method: "POST",
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.error || "Photo upload failed.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data as { url: string; path: string; fileName: string };
}
