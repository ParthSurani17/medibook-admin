import { http, getList } from "./http.js";

export const testimonialsApi = {
  list: () => getList("/admin/testimonials", 200),
  create: (data) => http.post("/admin/testimonials", data),
  remove: (id) => http.delete(`/admin/testimonials/${id}`),
};
