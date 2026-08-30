import { http } from "./http";
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
  list: () => http.get<PaginatedList<RawDoctor>>("/admin/doctors"),
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
