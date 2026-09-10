import { http } from "./http";
import type {
  ApiAppointmentStatus,
  PaginatedList,
  RawAppointment,
  RescheduleAppointmentPayload,
} from "../types";

export const appointmentsApi = {
  list: () => http.get<PaginatedList<RawAppointment>>("/admin/appointments?take=100"),
  updateStatus: (id: string, status: ApiAppointmentStatus) =>
    http.patch<RawAppointment>(`/admin/appointments/${id}/status`, { status }),
  reschedule: (id: string, data: RescheduleAppointmentPayload) =>
    http.patch<RawAppointment>(`/admin/appointments/${id}/reschedule`, data),
  remove: (id: string) => http.delete(`/admin/appointments/${id}`),
};
