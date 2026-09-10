import { http, getList } from "./http.js";

export const departmentsApi = {
  list: (params) => getList("/admin/departments", 200, params),
  create: (data) => http.post("/admin/departments", data),
  update: (id, data) => http.patch(`/admin/departments/${id}`, data),
  remove: (id) => http.delete(`/admin/departments/${id}`),
};
