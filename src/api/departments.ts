import { http } from "./http";
import type { Department, PaginatedList } from "../types";

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export const departmentsApi = {
  list: () => http.get<PaginatedList<Department>>("/admin/departments", { take: 20}),
  create: (data: CreateDepartmentPayload) =>
    http.post<Department>("/admin/departments", data),
  update: (id: string, data: Partial<CreateDepartmentPayload>) =>
    http.patch<Department>(`/admin/departments/${id}`, data),
  remove: (id: string) => http.delete(`/admin/departments/${id}`),
};
