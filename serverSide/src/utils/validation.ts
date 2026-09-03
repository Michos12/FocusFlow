export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_MAX_LENGTH = 255;

// Deliberately permissive: it rejects the obviously malformed without turning
// away valid addresses that a stricter pattern would reject.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || email.trim().length === 0) {
    return "Email is required";
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    return `Email must be ${EMAIL_MAX_LENGTH} characters or fewer`;
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address, for example name@example.com";
  }
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  // bcrypt silently truncates beyond 72 bytes, so reject instead of pretending
  // the extra characters add anything.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be 72 bytes or fewer";
  }
  return null;
}
