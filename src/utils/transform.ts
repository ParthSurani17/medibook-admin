import type {
  ApiAppointmentStatus,
  AppNotification,
  Appointment,
  DayCode,
  Doctor,
  Patient,
  RawAppointment,
  RawDoctor,
  RawPatient,
  RawTestimonial,
  RawUserNotification,
  Testimonial,
  UiAppointmentStatus,
} from "../types";

export const DAY_TO_API: Record<string, DayCode> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

export const DAY_TO_UI: Record<DayCode, string> = Object.fromEntries(
  Object.entries(DAY_TO_API).map(([full, short]) => [short, full])
) as Record<DayCode, string>;

// Maps between the backend's UPPERCASE enum statuses and the Title-Case
// strings this UI (originally built against a localStorage mock) expects.
const STATUS_TO_UI: Record<ApiAppointmentStatus, UiAppointmentStatus> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const STATUS_TO_API: Record<UiAppointmentStatus, ApiAppointmentStatus> = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
};

export const toUiStatus = (apiStatus: ApiAppointmentStatus): UiAppointmentStatus =>
  STATUS_TO_UI[apiStatus] || (apiStatus as unknown as UiAppointmentStatus);

export const toApiStatus = (uiStatus: UiAppointmentStatus): ApiAppointmentStatus =>
  STATUS_TO_API[uiStatus] || (uiStatus as unknown as ApiAppointmentStatus);

export const isoDateOnly = (isoDateTime?: string | null): string =>
  isoDateTime ? String(isoDateTime).slice(0, 10) : "";

// Backend Appointment -> the shape AppointmentCard / AdminAppointments /
// Patients / Reports expect. `doctorsById` is the doctors array from
// ClinicContext (already loaded), used as a fallback if the appointment's
// own `.doctor` relation isn't populated.
export function mapAppointment(
  raw: RawAppointment,
  doctorsById: Record<string, Doctor> = {}
): Appointment {
  const doctor = raw.doctor || doctorsById[raw.doctorId] || null;
  const patient = raw.patient || null;

  return {
    id: raw.id,
    patientId: raw.patientId,
    patientName: patient?.fullName || "Unknown patient",
    email: patient?.email || "",
    mobile: patient?.phone || "",
    doctorId: raw.doctorId,
    doctorName: doctor?.name || "Unknown doctor",
    date: isoDateOnly(raw.date),
    timeSlot: raw.timeSlot,
    problem: raw.reason || "",
    fee: doctor?.fee ?? "",
    status: toUiStatus(raw.status),
    createdAt: raw.createdAt,
  };
}

// Backend Doctor -> the shape Doctors.tsx / Reports.tsx expect. Availability
// stays as the real array of {id, day, startTime, endTime, slotDuration}
// windows (kept as-is per your instruction) — `availabilityDaysSummary` is
// just a convenience string for card display.
export function mapDoctor(raw: RawDoctor): Doctor {
  const availability = raw.availability || [];
  const days = [...new Set(availability.map((a) => a.day))];
  const storedPhoto = raw.photoUrl || (raw as RawDoctor & { photo?: string | null }).photo
    ? String(raw.photoUrl || (raw as RawDoctor & { photo?: string | null }).photo)
    : "";
  const photo = storedPhoto
    ? /^https?:\/\//i.test(storedPhoto)
      ? storedPhoto
      : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/${storedPhoto.replace(/^\/+/, "")}`
    : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#dbeafe"/><text x="48" y="59" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#2563eb">${String(raw.name || "D").trim().charAt(0).toUpperCase()}</text></svg>`)}`;

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email || "",
    photo,
    departmentId: raw.departmentId,
    qualification: raw.qualification || "",
    hospital: raw.hospital || "",
    experience: raw.experience ?? "",
    fee: raw.fee ?? "",
    rating: 0,
    availability, // real range-based windows: [{id, day, startTime, endTime, slotDuration}]
    availabilityDaysSummary: days.join(", "),
  };
}

export function mapPatient(raw: RawPatient): Patient {
  return {
    id: raw.id,
    name: raw.fullName || "Unnamed",
    email: raw.email || "",
    phone: raw.phone || "",
    blocked: raw.status === "DISABLED",
  };
}

export function mapTestimonial(raw: RawTestimonial): Testimonial {
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role,
    quote: raw.quote,
    avatarSeed: raw.avatarSeed || raw.name,
  };
}

export function mapNotification(raw: RawUserNotification): AppNotification {
  return {
    id: raw.id,
    message: raw.notification?.body || raw.notification?.title || "",
    read: !!raw.isRead,
    createdAt: raw.createdAt,
  };
}
