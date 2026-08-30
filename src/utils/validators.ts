export type FormErrors = Record<string, string>;

export const isRequired = (value: string): boolean => value.trim().length > 0;

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidMobile = (value: string): boolean => /^[6-9]\d{9}$/.test(value.trim());

export const isValidAge = (value: string | number): boolean => {
  const age = Number(value);
  return Number.isInteger(age) && age > 0 && age <= 120;
};

export const isFutureOrToday = (dateString: string): boolean => {
  if (!dateString) return false;
  const chosen = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return chosen >= today;
};

export interface AppointmentFormValues {
  patientName: string;
  email: string;
  mobile: string;
  age: string | number;
  gender: string;
  date: string;
  timeSlot: string;
  problem: string;
}

// Validates the appointment booking form and returns an { field: message } map.
export function validateAppointmentForm(values: AppointmentFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!isRequired(values.patientName)) {
    errors.patientName = "Please enter the patient's full name.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!isValidMobile(values.mobile)) {
    errors.mobile = "Enter a valid 10-digit mobile number.";
  }
  if (!isValidAge(values.age)) {
    errors.age = "Enter a valid age between 1 and 120.";
  }
  if (!isRequired(values.gender)) {
    errors.gender = "Please select a gender.";
  }
  if (!isFutureOrToday(values.date)) {
    errors.date = "Please choose today or a future date.";
  }
  if (!isRequired(values.timeSlot)) {
    errors.timeSlot = "Please select a time slot.";
  }
  if (!isRequired(values.problem)) {
    errors.problem = "Please briefly describe the problem.";
  }

  return errors;
}

export const isValidPassword = (value: string): boolean => value.trim().length >= 6;

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegisterForm(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!isRequired(values.name)) {
    errors.name = "Please enter your full name.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!isValidPassword(values.password)) {
    errors.password = "Password must be at least 6 characters.";
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export function validateLoginForm(values: LoginFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!isRequired(values.password)) {
    errors.password = "Please enter your password.";
  }

  return errors;
}

export const isValidCardNumber = (value: string): boolean =>
  /^\d{16}$/.test(value.replace(/\s/g, ""));

export const isValidExpiry = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  const [mm, yy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  const currentMM = now.getMonth() + 1;
  return yy > currentYY || (yy === currentYY && mm >= currentMM);
};

export const isValidCVV = (value: string): boolean => /^\d{3}$/.test(value);

export interface PaymentFormValues {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export function validatePaymentForm(values: PaymentFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!isRequired(values.cardName)) {
    errors.cardName = "Please enter the name on the card.";
  }
  if (!isValidCardNumber(values.cardNumber)) {
    errors.cardNumber = "Enter a valid 16-digit card number.";
  }
  if (!isValidExpiry(values.expiry)) {
    errors.expiry = "Enter a valid future expiry date (MM/YY).";
  }
  if (!isValidCVV(values.cvv)) {
    errors.cvv = "Enter a valid 3-digit CVV.";
  }
  return errors;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  phone?: string;
}

export function validateProfileForm(values: ProfileFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!isRequired(values.name)) {
    errors.name = "Please enter your name.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.phone && !isValidMobile(values.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  return errors;
}
