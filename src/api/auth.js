import { http } from "./http.js";

export const authApi = {
  login: (email, password) => http.post("/admin/auth/login", { email, password }),
  forgotPassword: (email) => http.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    http.post("/api/auth/reset-password", { token, newPassword }),
  getProfile: () => http.get("/admin/profile"),
  updateProfile: (data) => http.patch("/admin/profile", data),
};
