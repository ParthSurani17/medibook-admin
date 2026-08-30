// Domain types shared across the app. Field names/shapes mirror what the
// NestJS backend actually returns (see the backend's Prisma schema +
// DTOs) — the `mapX` helpers in utils/transform.ts adapt these into the
// simpler UI-facing shapes the page components consume.

export type UUID = string;

// ─── Auth ───────────────────────────────────────────────

export interface CurrentUser {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  role: "admin";
}

export interface AdminProfileResponse {
  id: UUID;
  fullName: string | null;
  email: string;
  phone: string | null;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  accessToken: string;
  user: {
    id: UUID;
    fullName: string | null;
    email: string;
    phone: string | null;
  };
}

export interface ApiMessageResponse {
  status: boolean;
  message: string;
}

// ─── Departments ────────────────────────────────────────

export interface Department {
  id: UUID;
  name: string;
  description?: string | null;
}

// ─── Doctors ────────────────────────────────────────────

export type DayCode = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface DoctorAvailabilityWindow {
  id: UUID;
  doctorId: UUID;
  day: DayCode;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  slotDuration: number; // minutes
}

// Raw shape as returned by the backend (before mapDoctor()).
export interface RawDoctor {
  id: UUID;
  name: string;
  photoUrl?: string | null;
  departmentId: UUID;
  qualification?: string | null;
  experience?: number | null;
  fee: number;
  availability?: DoctorAvailabilityWindow[];
}

// Shape used throughout the UI (after mapDoctor()).
export interface Doctor {
  id: UUID;
  name: string;
  photo: string;
  departmentId: UUID;
  qualification: string;
  experience: number | "";
  fee: number | "";
  rating: number;
  availability: DoctorAvailabilityWindow[];
  availabilityDaysSummary: string;
}

export interface CreateDoctorPayload {
  name: string;
  departmentId: string;
  qualification: string;
  experience: number;
  fee: number;
  photo?: string;
}

// ─── Appointments ───────────────────────────────────────

export type ApiAppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type UiAppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface RawAppointment {
  id: UUID;
  patientId: UUID;
  doctorId: UUID;
  date: string; // ISO date-time
  timeSlot: string;
  reason?: string | null;
  status: ApiAppointmentStatus;
  createdAt: string;
  patient?: { fullName?: string | null; email?: string | null; phone?: string | null } | null;
  doctor?: { name?: string; fee?: number } | null;
}

export interface Appointment {
  id: UUID;
  patientId: UUID;
  patientName: string;
  email: string;
  mobile: string;
  doctorId: UUID;
  doctorName: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string;
  problem: string;
  fee: number | "";
  status: UiAppointmentStatus;
  createdAt: string;
}

export interface RescheduleAppointmentPayload {
  date: string;
  timeSlot: string;
  doctorId?: string;
}

export interface AvailableSlot {
  time: string;
  isBooked: boolean;
}

// ─── Patients ───────────────────────────────────────────

export interface RawPatient {
  id: UUID;
  fullName: string | null;
  email: string;
  phone: string | null;
  status: "ENABLED" | "DISABLED";
}

export interface Patient {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  blocked: boolean;
}

// ─── Testimonials ───────────────────────────────────────

export interface RawTestimonial {
  id: UUID;
  name: string;
  role: string;
  quote: string;
  avatarSeed?: string | null;
}

export interface Testimonial {
  id: UUID;
  name: string;
  role: string;
  quote: string;
  avatarSeed: string;
}

export interface CreateTestimonialPayload {
  name: string;
  role: string;
  quote: string;
  avatarSeed?: string;
}

// ─── Notifications ───────────────────────────────────────

export interface RawUserNotification {
  id: UUID;
  isRead: boolean;
  createdAt: string;
  notification?: { title?: string; body?: string } | null;
}

export interface AppNotification {
  id: UUID;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────

export interface MonthlyChartPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todaysAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  monthlyChart: MonthlyChartPoint[];
}

// ─── Generic paginated list response ───────────────────────

export interface PaginatedList<T> {
  total: number;
  list: T[];
  hasMany: boolean;
  count: number;
}

// ─── Toast ──────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}
