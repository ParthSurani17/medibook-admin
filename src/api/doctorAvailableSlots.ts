import { http } from "./http";
import type { AvailableSlot } from "../types";

// Public endpoint (no admin guard) — reused here for the reschedule modal so
// it shows the doctor's real, live slot availability instead of a static list.
export const getAvailableSlots = (doctorId: string, date: string) =>
  http.get<AvailableSlot[]>(`/doctors/${doctorId}/available-slots`, { date });
