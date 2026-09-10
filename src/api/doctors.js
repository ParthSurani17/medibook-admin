import { http, getList, getToken } from "./http.js";

export const doctorsApi = {
  list: (params) => getList("/admin/doctors", 200, params),
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

export async function uploadDoctorPhoto(doctorId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/admin/doctors/${doctorId}/photo`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
  );
  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || data?.error || "Photo upload failed.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return data;
}
