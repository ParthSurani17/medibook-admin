import { http } from "./http";
import type { DashboardStats } from "../types";

export const dashboardApi = {
  getStats: () => http.get<DashboardStats>("/admin/dashboard/stats"),
};
