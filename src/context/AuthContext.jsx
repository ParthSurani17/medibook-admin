import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { authApi } from "../api/auth.js";
import { patientsApi } from "../api/patients.js";
import { getToken, setToken } from "../api/http.js";
import { mapPatient } from "../utils/transform.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [allPatients, setAllPatients] = useState([]);

  // On first load, if we have a stored token, verify it's still valid by
  // fetching the profile — this restores the session across page refreshes.
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await authApi.getProfile();
        setCurrentUser({
          id: profile.id,
          name: profile.fullName || "",
          email: profile.email,
          phone: profile.phone || "",
          role: "admin",
        });
      } catch {
        setToken(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const refreshPatients = useCallback(async () => {
    try {
      const res = await patientsApi.list();
      setAllPatients((res.list || []).map(mapPatient));
    } catch (err) {
      console.error("Failed to load patients:", err.message);
    }
  }, []);

  useEffect(() => {
    if (currentUser) refreshPatients();
  }, [currentUser, refreshPatients]);

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await authApi.login(email, password);
      setToken(res.accessToken);
      setCurrentUser({
        id: res.user.id,
        name: res.user.fullName || "",
        email: res.user.email,
        phone: res.user.phone || "",
        role: "admin",
      });
      return { success: true, role: "admin" };
    } catch (err) {
      return { success: false, message: err.message || "Incorrect email or password." };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  // Real flow now: request a reset email, then separately submit the token
  // (from that email) + a new password. See ForgotPassword.jsx.
  const requestPasswordReset = useCallback(async (email) => {
    try {
      const res = await authApi.forgotPassword(email);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const resetPasswordWithToken = useCallback(async (token, newPassword) => {
    try {
      await authApi.resetPassword(token, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await authApi.updateProfile({
        fullName: updates.name,
        phone: updates.phone,
      });
      setCurrentUser((prev) => ({
        ...prev,
        name: res.fullName || "",
        phone: res.phone || "",
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  const setPatientBlocked = useCallback(
    async (id, blocked) => {
      try {
        if (blocked) await patientsApi.block(id);
        else await patientsApi.unblock(id);
        setAllPatients((prev) =>
          prev.map((p) => (p.id === id ? { ...p, blocked } : p))
        );
      } catch (err) {
        console.error("Failed to update patient block status:", err.message);
      }
    },
    []
  );

  const value = {
    currentUser,
    authLoading,
    login,
    logout,
    requestPasswordReset,
    resetPasswordWithToken,
    updateProfile,
    allPatients,
    setPatientBlocked,
    refreshPatients,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
