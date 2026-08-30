import { http } from "./http.js";

export const notificationsApi = {
  list: () => http.get("/admin/notifications"),
  markAllRead: () => http.patch("/admin/notifications/read-all"),
};
