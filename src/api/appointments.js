import { http } from "./http.js";

export const appointmentsApi = {
  list: () => http.get("/admin/appointments", { limit: 500 }),
  updateStatus: (id, status) => http.patch(`/admin/appointments/${id}/status`, { status }),
  reschedule: (id, data) => http.patch(`/admin/appointments/${id}/reschedule`, data),
  remove: (id) => http.delete(`/admin/appointments/${id}`),
};
