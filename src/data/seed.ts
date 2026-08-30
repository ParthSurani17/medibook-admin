// Initial seed data. This is only used the very first time the app runs on
// a fresh browser — after that, everything lives in localStorage and is
// fully managed (added/edited/deleted) by the admin.

const avatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b7d0ff,cdf5e3,eaf2ff`;

export const seedDepartments = [
  { id: "DEPT-1", name: "Cardiology", description: "Heart and vascular care." },
  { id: "DEPT-2", name: "Dentistry", description: "Teeth and oral health." },
  { id: "DEPT-3", name: "Neurology", description: "Brain and nervous system." },
  { id: "DEPT-4", name: "Orthopedics", description: "Bones and joints." },
  { id: "DEPT-5", name: "Pediatrics", description: "Child healthcare." },
  { id: "DEPT-6", name: "Dermatology", description: "Skin and hair care." },
  { id: "DEPT-7", name: "ENT", description: "Ear, nose and throat care." },
  { id: "DEPT-8", name: "General Medicine", description: "Everyday health concerns." },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const seedDoctors = [
  {
    id: "DOC-1",
    name: "Dr. Aisha Kapoor",
    photo: avatar("Aisha Kapoor"),
    departmentId: "DEPT-1",
    qualification: "MBBS, MD (Cardiology), DM",
    experience: 14,
    fee: 800,
    rating: 4.8,
    availability: { days: ["Monday", "Wednesday", "Friday"], slots: ["10:00 AM", "10:30 AM", "11:00 AM", "05:00 PM", "05:30 PM", "06:00 PM"] },
  },
  {
    id: "DOC-2",
    name: "Dr. Rohan Mehta",
    photo: avatar("Rohan Mehta"),
    departmentId: "DEPT-2",
    qualification: "BDS, MDS (Orthodontics)",
    experience: 9,
    fee: 400,
    rating: 4.6,
    availability: { days: ["Tuesday", "Thursday", "Saturday"], slots: ["09:00 AM", "09:30 AM", "10:00 AM", "04:00 PM", "04:30 PM"] },
  },
  {
    id: "DOC-3",
    name: "Dr. Neha Sharma",
    photo: avatar("Neha Sharma"),
    departmentId: "DEPT-3",
    qualification: "MBBS, MD, DM (Neurology)",
    experience: 12,
    fee: 900,
    rating: 4.9,
    availability: { days: ["Monday", "Tuesday", "Thursday"], slots: ["11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "03:30 PM"] },
  },
  {
    id: "DOC-4",
    name: "Dr. Vikram Rao",
    photo: avatar("Vikram Rao"),
    departmentId: "DEPT-4",
    qualification: "MBBS, MS (Ortho)",
    experience: 16,
    fee: 700,
    rating: 4.7,
    availability: { days: ["Wednesday", "Friday", "Saturday"], slots: ["10:00 AM", "10:30 AM", "05:00 PM", "05:30 PM", "06:00 PM"] },
  },
  {
    id: "DOC-5",
    name: "Dr. Priya Iyer",
    photo: avatar("Priya Iyer"),
    departmentId: "DEPT-5",
    qualification: "MBBS, MD (Pediatrics)",
    experience: 10,
    fee: 500,
    rating: 4.9,
    availability: { days: DAYS.slice(0, 6), slots: ["09:00 AM", "09:30 AM", "10:00 AM", "04:00 PM", "04:30 PM", "05:00 PM"] },
  },
  {
    id: "DOC-6",
    name: "Dr. Kabir Malhotra",
    photo: avatar("Kabir Malhotra"),
    departmentId: "DEPT-6",
    qualification: "MBBS, MD (Dermatology)",
    experience: 8,
    fee: 600,
    rating: 4.5,
    availability: { days: ["Tuesday", "Wednesday", "Friday"], slots: ["11:00 AM", "11:30 AM", "03:00 PM", "03:30 PM", "04:00 PM"] },
  },
  {
    id: "DOC-7",
    name: "Dr. Sanya Kapoor",
    photo: avatar("Sanya Kapoor"),
    departmentId: "DEPT-7",
    qualification: "MBBS, MS (ENT)",
    experience: 11,
    fee: 550,
    rating: 4.7,
    availability: { days: ["Monday", "Thursday", "Saturday"], slots: ["10:00 AM", "10:30 AM", "11:00 AM", "05:00 PM"] },
  },
  {
    id: "DOC-8",
    name: "Dr. Farhan Sheikh",
    photo: avatar("Farhan Sheikh"),
    departmentId: "DEPT-8",
    qualification: "MBBS, MD (General Medicine)",
    experience: 7,
    fee: 350,
    rating: 4.5,
    availability: { days: DAYS.slice(0, 6), slots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "04:00 PM", "04:30 PM"] },
  },
];

export const seedTestimonials = [
  { id: "TST-1", name: "Sneha Agarwal", role: "Patient", quote: "Booking an appointment took less than two minutes. I could see the doctor's fee and time slots upfront, no surprises at the clinic.", avatarSeed: "Sneha Agarwal" },
  { id: "TST-2", name: "Manoj Tiwari", role: "Patient", quote: "I liked being able to filter doctors by department and see real available time slots before booking.", avatarSeed: "Manoj Tiwari" },
  { id: "TST-3", name: "Fatima Sheikh", role: "Parent", quote: "Managing my son's checkups from My Appointments has been a relief — I can cancel or track them without a single phone call.", avatarSeed: "Fatima Sheikh" },
  { id: "TST-4", name: "Aakash Verma", role: "Patient", quote: "The doctor profiles gave me enough detail to pick the right specialist the first time, instead of guessing at the clinic.", avatarSeed: "Aakash Verma" },
];

export const WEEKDAYS = DAYS;
