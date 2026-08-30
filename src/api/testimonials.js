import { http } from "./http.js";

export const testimonialsApi = {
  list: () => http.get("/admin/testimonials", { limit: 200 }),
  create: (data) => http.post("/admin/testimonials", data),
  remove: (id) => http.delete(`/admin/testimonials/${id}`),
};
