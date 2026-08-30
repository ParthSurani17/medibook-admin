import { http } from "./http.js";

export const doctorsApi = {
  list: () => http.get("/admin/doctors", { limit: 200 }),
  getOne: (id) => http.get(`/admin/doctors/${id}`),
  create: (data) => http.post("/admin/doctors", data),
  update: (id, data) => http.patch(`/admin/doctors/${id}`, data),
  remove: (id) => http.delete(`/admin/doctors/${id}`),
  listAvailability: (doctorId) => http.get(`/admin/doctors/${doctorId}/availability`),
  addAvailability: (doctorId, data) =>
    http.post(`/admin/doctors/${doctorId}/availability`, data),
  removeAvailability: (availabilityId) =>
    http.delete(`/admin/doctors/availability/${availabilityId}`),
};
