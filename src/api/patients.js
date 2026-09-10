import { http, getList } from "./http.js";

export const patientsApi = {
  list: () => getList("/admin/patients", 500),
  block: (id) => http.patch(`/admin/patients/${id}/block`),
  unblock: (id) => http.patch(`/admin/patients/${id}/unblock`),
};
