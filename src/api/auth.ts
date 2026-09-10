import { http } from "./http";
import type {
  AdminProfileResponse,
  ApiMessageResponse,
  LoginResponse,
} from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    http.post<LoginResponse>("/admin/auth/login", { email, password }),
  forgotPassword: (email: string) =>
    http.post<ApiMessageResponse>("/api/auth/forgot-password", {
      email,
      resetUrlBase: `${window.location.origin}/reset-password`,
    }),
  resetPassword: (token: string, newPassword: string) =>
    http.post<ApiMessageResponse>("/api/auth/reset-password", { token, newPassword }),
  getProfile: () => http.get<AdminProfileResponse>("/admin/profile"),
  updateProfile: (data: { fullName?: string; phone?: string }) =>
    http.patch<AdminProfileResponse>("/admin/profile", data),
};
