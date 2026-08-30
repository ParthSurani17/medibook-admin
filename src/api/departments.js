import { http } from "./http.js";

export const departmentsApi = {
  list: () => http.get("/admin/departments", { limit: 200 }),
  create: (data) => http.post("/admin/departments", data),
  update: (id, data) => http.patch(`/admin/departments/${id}`, data),
  remove: (id) => http.delete(`/admin/departments/${id}`),
};
