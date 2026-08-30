import { http } from "./http.js";

export const patientsApi = {
  list: () => http.get("/admin/patients", { limit: 500 }),
  block: (id) => http.patch(`/admin/patients/${id}/block`),
  unblock: (id) => http.patch(`/admin/patients/${id}/unblock`),
};
