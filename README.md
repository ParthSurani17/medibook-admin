# MediBook Admin

React (Vite) admin panel for the Doctor Appointment System. Talks to the
NestJS backend over its real API — no more localStorage mock data.

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

## Connecting to the backend

`.env` already contains:
```
VITE_API_BASE_URL=http://localhost:3000
```

Point this at wherever your backend (`doctor-appointment-nest-mongo`) is
running. Make sure the backend is up first:

```bash
# in the backend project
npm run start:dev
```

## Logging in

There's no public admin signup (by design). Use the credentials created by
the backend's seed script:

```bash
# in the backend project
npm run seed
# ✅ Admin ready — login with email="admin@medibook.demo" password="Admin@123"
```

Log in with those at `/login`.

## What changed from the original design

This started as a frontend-only demo (all data in `localStorage`, fake
auth). It's now wired to the real backend:

- `src/api/` — one fetch-based module per resource (auth, departments,
  doctors, appointments, patients, dashboard, testimonials, notifications),
  plus `http.js` which attaches the JWT and handles errors centrally.
- `src/utils/transform.js` — maps backend shapes (e.g. `PENDING` →
  `"Pending"`, 3-letter day codes ↔ full day names) to what the existing UI
  components expect, so most pages needed no changes at all.
- **Doctor availability** now matches the backend's real model: instead of
  a flat "pick days + type slot times" form, you add explicit weekly
  windows (day + start time + end time + slot duration) — same as what
  powers the actual booking slot generation on the patient side. In
  `Doctors.jsx`, save the doctor's basic info first, then add availability
  windows right in the same modal.
- **Forgot password** is now a real two-step flow: request a reset email,
  then paste the token from that email (or — if you haven't configured SMTP
  in the backend's `.env` — check the backend server's console, where the
  email gets logged instead of sent) along with your new password.
- **Reschedule** now pulls live available slots from the backend instead of
  a static list, so you can't accidentally double-book a doctor.
- Admin **Profile** email is read-only (it's the login identifier).

## Known gaps

- `Reports.jsx` computes its charts client-side from the loaded
  `appointments` list rather than a dedicated backend reports endpoint —
  fine at demo scale, but would want pagination/server-side aggregation for
  a larger dataset.
- Testimonials/Departments CRUD calls aren't wrapped in try/catch at the
  page level, so a failed request there fails silently in the console
  rather than showing a toast — worth tightening up if you extend this.
