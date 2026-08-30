import { http } from "./http.js";

// Public endpoint (no admin guard) — reused here for the reschedule modal so
// it shows the doctor's real, live slot availability instead of a static list.
export const getAvailableSlots = (doctorId, date) =>
  http.get(`/doctors/${doctorId}/available-slots`, { date });
