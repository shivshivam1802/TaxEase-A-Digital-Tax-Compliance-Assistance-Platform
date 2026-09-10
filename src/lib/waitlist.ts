export const WAITLIST_STORAGE_KEY = "niyam.waitlist.v1";

export const USER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "small_business", label: "Small business" },
] as const;

export type UserType = (typeof USER_TYPES)[number]["value"];

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  createdAt: string;
};

export type WaitlistErrors = {
  name?: string;
  email?: string;
  userType?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateWaitlistInput(input: {
  name: string;
  email: string;
  userType: string;
}): { ok: true; data: Omit<WaitlistEntry, "id" | "createdAt"> } | { ok: false; errors: WaitlistErrors } {
  const errors: WaitlistErrors = {};
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  const userType = input.userType;

  if (!name) {
    errors.name = "Enter your full name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 80) {
    errors.name = "Name must be 80 characters or fewer.";
  } else if (!/^[\p{L}\s.'-]+$/u.test(name)) {
    errors.name = "Use letters, spaces, hyphens, or apostrophes only.";
  }

  if (!email) {
    errors.email = "Enter a work or personal email.";
  } else if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    errors.email = "Enter a valid email address.";
  }

  const resolvedType: UserType | null =
    userType === "individual" || userType === "small_business" ? userType : null;

  if (!resolvedType) {
    errors.userType = "Choose Individual or Small business.";
  }

  if (Object.keys(errors).length > 0 || !resolvedType) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      userType: resolvedType,
    },
  };
}

export function readWaitlist(): WaitlistEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isWaitlistEntry);
  } catch {
    return [];
  }
}

export function saveWaitlistEntry(
  input: Omit<WaitlistEntry, "id" | "createdAt">
): { ok: true; entry: WaitlistEntry } | { ok: false; errors: WaitlistErrors } {
  const existing = readWaitlist();
  const duplicate = existing.find((entry) => entry.email === input.email);

  if (duplicate) {
    return {
      ok: false,
      errors: {
        email: "This email is already on the waitlist.",
        form: "You are already on the list. We will write when access opens.",
      },
    };
  }

  const entry: WaitlistEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      WAITLIST_STORAGE_KEY,
      JSON.stringify([entry, ...existing])
    );
    return { ok: true, entry };
  } catch {
    return {
      ok: false,
      errors: {
        form: "Could not save your request in this browser. Check storage permissions and try again.",
      },
    };
  }
}

function isWaitlistEntry(value: unknown): value is WaitlistEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.email === "string" &&
    (entry.userType === "individual" || entry.userType === "small_business") &&
    typeof entry.createdAt === "string"
  );
}
