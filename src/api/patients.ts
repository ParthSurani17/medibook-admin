import { http } from "./http";
import type { PaginatedList, RawPatient } from "../types";

export const patientsApi = {
  list: () => http.get<PaginatedList<RawPatient>>("/admin/patients"),
  block: (id: string) => http.patch<RawPatient>(`/admin/patients/${id}/block`),
  unblock: (id: string) => http.patch<RawPatient>(`/admin/patients/${id}/unblock`),
};
