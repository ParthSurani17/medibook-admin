import { http } from "./http.js";

export const dashboardApi = {
  getStats: () => http.get("/admin/dashboard/stats"),
};
