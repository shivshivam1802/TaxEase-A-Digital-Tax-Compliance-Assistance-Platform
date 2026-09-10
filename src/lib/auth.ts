import {
  isUserType,
  type UserType,
} from "@/lib/user-type";
import {
  cleanPersonName,
  normalizeEmail,
  validateEmailAddress,
  validatePersonName,
} from "@/lib/validation";

export const USERS_STORAGE_KEY = "niyam.users.v1";
export const SESSION_STORAGE_KEY = "niyam.session.v1";
export const AUTH_CHANGE_EVENT = "niyam-auth-change";

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  passwordReset: {
    token: string;
    expiresAt: string;
  } | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  userId: string;
  createdAt: string;
};

export type FieldErrors = Record<string, string | undefined> & {
  form?: string;
};

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

const LETTER = /[\p{L}]/u;
const DIGIT = /\d/;

export function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Enter a password.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 72) {
    return "Password must be 72 characters or fewer.";
  }
  if (/\s/.test(password)) {
    return "Password cannot contain spaces.";
  }
  if (!LETTER.test(password) || !DIGIT.test(password)) {
    return "Use at least one letter and one number.";
  }
  return undefined;
}

export function validateSignUpInput(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
}):
  | {
      ok: true;
      data: {
        name: string;
        email: string;
        password: string;
        userType: UserType;
      };
    }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const nameError = validatePersonName(input.name);
  const emailError = validateEmailAddress(input.email);
  const passwordError = validatePassword(input.password);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (!input.confirmPassword) {
    errors.confirmPassword = "Re-enter your password.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
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
      password: input.password,
      userType: input.userType,
    },
  };
}

export function validateSignInInput(input: { email: string; password: string }):
  | { ok: true; data: { email: string; password: string } }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const emailError = validateEmailAddress(input.email);

  if (emailError) errors.email = emailError;
  if (!input.password) errors.password = "Enter your password.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      email: normalizeEmail(input.email),
      password: input.password,
    },
  };
}

export function validateForgotPasswordInput(email: string):
  | { ok: true; data: { email: string } }
  | { ok: false; errors: FieldErrors } {
  const emailError = validateEmailAddress(email);
  if (emailError) {
    return { ok: false, errors: { email: emailError } };
  }
  return { ok: true, data: { email: normalizeEmail(email) } };
}

export function validateResetPasswordInput(input: {
  token: string;
  password: string;
  confirmPassword: string;
}):
  | { ok: true; data: { token: string; password: string } }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const token = input.token.trim();
  const passwordError = validatePassword(input.password);

  if (!token) errors.form = "This reset link is missing a token.";
  if (passwordError) errors.password = passwordError;
  if (!input.confirmPassword) {
    errors.confirmPassword = "Re-enter your password.";
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { token, password: input.password } };
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }
  return value;
}

export function readUsers(): AuthUser[] {
  const raw = readKey(USERS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAuthUser);
  } catch {
    return [];
  }
}

export function readSession(): Session | null {
  const raw = readKey(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSignedInUser(): PublicUser | null {
  const session = readSession();
  if (!session) return null;
  const user = readUsers().find((entry) => entry.id === session.userId);
  return user ? toPublicUser(user) : null;
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
}): Promise<AuthResult<PublicUser>> {
  const validated = validateSignUpInput(input);
  if (!validated.ok) return validated;

  const users = readUsers();
  if (users.some((user) => user.email === validated.data.email)) {
    return {
      ok: false,
      errors: {
        email: "An account already exists for this email.",
        form: "Sign in instead, or reset your password if you forgot it.",
      },
    };
  }

  const now = new Date().toISOString();
  const passwordSalt = createSalt();
  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: validated.data.name,
    email: validated.data.email,
    userType: validated.data.userType,
    passwordSalt,
    passwordHash: await hashPassword(validated.data.password, passwordSalt),
    createdAt: now,
    updatedAt: now,
    passwordReset: null,
  };

  writeUsers([user, ...users]);
  writeSession({ userId: user.id, createdAt: now });
  emitAuthChange();

  return { ok: true, data: toPublicUser(user) };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult<PublicUser>> {
  const validated = validateSignInInput(input);
  if (!validated.ok) return validated;

  const user = readUsers().find((entry) => entry.email === validated.data.email);
  const invalid = {
    ok: false as const,
    errors: {
      form: "Email or password is incorrect.",
    },
  };

  if (!user) {
    return invalid;
  }

  const hash = await hashPassword(validated.data.password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    return invalid;
  }

  writeSession({ userId: user.id, createdAt: new Date().toISOString() });
  emitAuthChange();
  return { ok: true, data: toPublicUser(user) };
}

export function signOut() {
  removeKey(SESSION_STORAGE_KEY);
  emitAuthChange();
}

export function requestPasswordReset(
  email: string
): AuthResult<{ email: string; resetUrl: string; expiresAt: string }> {
  const validated = validateForgotPasswordInput(email);
  if (!validated.ok) return validated;

  const users = readUsers();
  const index = users.findIndex((user) => user.email === validated.data.email);

  if (index === -1) {
    return {
      ok: false,
      errors: {
        email: "No account exists for this email.",
        form: "Check the address, or create an account.",
      },
    };
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  const user = users[index];
  users[index] = {
    ...user,
    updatedAt: new Date().toISOString(),
    passwordReset: { token, expiresAt },
  };
  writeUsers(users);

  const resetUrl = `/reset-password?token=${encodeURIComponent(token)}`;
  return {
    ok: true,
    data: {
      email: validated.data.email,
      resetUrl,
      expiresAt,
    },
  };
}

export async function resetPassword(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult<PublicUser>> {
  const validated = validateResetPasswordInput(input);
  if (!validated.ok) return validated;

  const users = readUsers();
  const now = Date.now();
  const index = users.findIndex((user) => {
    const reset = user.passwordReset;
    return (
      reset !== null &&
      reset.token === validated.data.token &&
      Date.parse(reset.expiresAt) > now
    );
  });

  if (index === -1) {
    return {
      ok: false,
      errors: {
        form: "This reset link is invalid or has expired. Request a new one.",
      },
    };
  }

  const user = users[index];
  const passwordSalt = createSalt();
  const updated: AuthUser = {
    ...user,
    passwordSalt,
    passwordHash: await hashPassword(validated.data.password, passwordSalt),
    passwordReset: null,
    updatedAt: new Date().toISOString(),
  };
  users[index] = updated;
  writeUsers(users);
  writeSession({ userId: updated.id, createdAt: updated.updatedAt });
  emitAuthChange();

  return { ok: true, data: toPublicUser(updated) };
}

export async function hashPassword(password: string, salt: string) {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return bufferToHex(digest);
}

function writeUsers(users: AuthUser[]) {
  writeKey(USERS_STORAGE_KEY, JSON.stringify(users));
}

function writeSession(session: Session) {
  writeKey(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function readKey(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string) {
  if (typeof window === "undefined") {
    throw new Error("Auth storage is only available in the browser.");
  }
  window.localStorage.setItem(key, value);
}

function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

function createSalt() {
  return randomHex(16);
}

function createToken() {
  return randomHex(24);
}

function randomHex(bytes: number) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return bufferToHex(values.buffer);
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  const reset = user.passwordReset;
  const resetOk =
    reset === null ||
    (typeof reset === "object" &&
      reset !== null &&
      typeof (reset as { token?: unknown }).token === "string" &&
      typeof (reset as { expiresAt?: unknown }).expiresAt === "string");

  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    isUserType(String(user.userType)) &&
    typeof user.passwordSalt === "string" &&
    typeof user.passwordHash === "string" &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string" &&
    resetOk
  );
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  return typeof session.userId === "string" && typeof session.createdAt === "string";
}
