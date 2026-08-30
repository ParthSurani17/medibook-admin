import { http } from "./http";
import type { RawUserNotification } from "../types";

export const notificationsApi = {
  list: () => http.get<RawUserNotification[]>("/admin/notifications"),
  markAllRead: () => http.patch<{ status: boolean; message: string }>("/admin/notifications/read-all"),
};
