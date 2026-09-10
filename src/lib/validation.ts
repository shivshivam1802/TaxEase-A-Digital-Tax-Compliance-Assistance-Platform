export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePersonName(name: string): string | undefined {
  const value = name.trim().replace(/\s+/g, " ");

  if (!value) {
    return "Enter your full name.";
  }
  if (value.length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (value.length > 80) {
    return "Name must be 80 characters or fewer.";
  }
  if (!/^[\p{L}\s.'-]+$/u.test(value)) {
    return "Use letters, spaces, hyphens, or apostrophes only.";
  }

  return undefined;
}

export function validateEmailAddress(email: string): string | undefined {
  const value = normalizeEmail(email);

  if (!value) {
    return "Enter a work or personal email.";
  }
  if (!EMAIL_PATTERN.test(value) || value.length > 120) {
    return "Enter a valid email address.";
  }

  return undefined;
}

export function cleanPersonName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}
