import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth";
import { patientsApi } from "../api/patients";
import { getToken, setToken } from "../api/http";
import { mapPatient } from "../utils/transform";
import type { CurrentUser, Patient } from "../types";

interface ActionResult {
  success: boolean;
  message?: string;
  role?: "admin";
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  authLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<ActionResult>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<ActionResult>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<ActionResult>;
  updateProfile: (updates: { name?: string; phone?: string }) => Promise<ActionResult>;
  allPatients: Patient[];
  setPatientBlocked: (id: string, blocked: boolean) => Promise<void>;
  refreshPatients: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(err: unknown, fallback = "Something went wrong."): string {
  return err instanceof Error ? err.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

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
      console.error("Failed to load patients:", errorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (currentUser) refreshPatients();
  }, [currentUser, refreshPatients]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }): Promise<ActionResult> => {
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
        return { success: false, message: errorMessage(err, "Incorrect email or password.") };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  // Real flow now: request a reset email, then separately submit the token
  // (from that email) + a new password. See ForgotPassword.tsx.
  const requestPasswordReset = useCallback(async (email: string): Promise<ActionResult> => {
    try {
      const res = await authApi.forgotPassword(email);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: errorMessage(err) };
    }
  }, []);

  const resetPasswordWithToken = useCallback(
    async (token: string, newPassword: string): Promise<ActionResult> => {
      try {
        await authApi.resetPassword(token, newPassword);
        return { success: true };
      } catch (err) {
        return { success: false, message: errorMessage(err) };
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: { name?: string; phone?: string }): Promise<ActionResult> => {
      try {
        const res = await authApi.updateProfile({
          fullName: updates.name,
          phone: updates.phone,
        });
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                name: res.fullName || "",
                phone: res.phone || "",
              }
            : prev
        );
        return { success: true };
      } catch (err) {
        return { success: false, message: errorMessage(err) };
      }
    },
    []
  );

  const setPatientBlocked = useCallback(async (id: string, blocked: boolean) => {
    try {
      if (blocked) await patientsApi.block(id);
      else await patientsApi.unblock(id);
      setAllPatients((prev) => prev.map((p) => (p.id === id ? { ...p, blocked } : p)));
    } catch (err) {
      console.error("Failed to update patient block status:", errorMessage(err));
    }
  }, []);

  const value: AuthContextValue = {
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
