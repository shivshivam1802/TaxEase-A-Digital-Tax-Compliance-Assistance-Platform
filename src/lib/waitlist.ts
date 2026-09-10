import { isUserType, USER_TYPES, type UserType } from "@/lib/user-type";
import {
  cleanPersonName,
  normalizeEmail,
  validateEmailAddress,
  validatePersonName,
} from "@/lib/validation";

export { USER_TYPES, type UserType };
export { normalizeEmail };

export const WAITLIST_STORAGE_KEY = "niyam.waitlist.v1";

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

export function validateWaitlistInput(input: {
  name: string;
  email: string;
  userType: string;
}): { ok: true; data: Omit<WaitlistEntry, "id" | "createdAt"> } | { ok: false; errors: WaitlistErrors } {
  const errors: WaitlistErrors = {};
  const nameError = validatePersonName(input.name);
  const emailError = validateEmailAddress(input.email);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (!isUserType(input.userType)) {
    errors.userType = "Choose Individual or Small business.";
  }

  if (Object.keys(errors).length > 0 || !isUserType(input.userType)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: cleanPersonName(input.name),
      email: normalizeEmail(input.email),
      userType: input.userType,
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
