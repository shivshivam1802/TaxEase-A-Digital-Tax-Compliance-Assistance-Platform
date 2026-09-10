import assert from "node:assert/strict";
import test from "node:test";

import {
  hashPassword,
  requestPasswordReset,
  resetPassword,
  SESSION_STORAGE_KEY,
  signIn,
  signOut,
  signUp,
  USERS_STORAGE_KEY,
  validatePassword,
  validateSignInInput,
  validateSignUpInput,
} from "./auth";

class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  get length() {
    return this.data.size;
  }
}

function installMemoryStorage() {
  const storage = new MemoryStorage();
  const store = storage as unknown as Storage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: store,
      dispatchEvent() {
        return true;
      },
    },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  return storage;
}

test("rejects a weak password", () => {
  assert.equal(validatePassword("short1"), "Password must be at least 8 characters.");
  assert.equal(validatePassword("onlyletters"), "Use at least one letter and one number.");
  assert.equal(validatePassword("12345678"), "Use at least one letter and one number.");
  assert.equal(validatePassword("GoodPass1"), undefined);
});

test("sign-up validation requires user type and matching passwords", () => {
  const result = validateSignUpInput({
    name: "A",
    email: "not-an-email",
    password: "GoodPass1",
    confirmPassword: "GoodPass2",
    userType: "",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.name, "Name must be at least 2 characters.");
    assert.equal(result.errors.email, "Enter a valid email address.");
    assert.equal(result.errors.confirmPassword, "Passwords do not match.");
    assert.equal(result.errors.userType, "Choose Individual or Small business.");
  }
});

test("sign-in validation requires email and password", () => {
  const result = validateSignInInput({ email: "", password: "" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.email, "Enter a work or personal email.");
    assert.equal(result.errors.password, "Enter your password.");
  }
});

test("hashes the same password to the same digest for a salt", async () => {
  const first = await hashPassword("GoodPass1", "abc");
  const second = await hashPassword("GoodPass1", "abc");
  const other = await hashPassword("GoodPass1", "def");
  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.equal(first.length, 64);
});

test("sign-up, sign-in, reset, and sign-out work against local storage", async () => {
  const storage = installMemoryStorage();

  const created = await signUp({
    name: "Priya Sharma",
    email: "Priya@Studio.IN",
    password: "GoodPass1",
    confirmPassword: "GoodPass1",
    userType: "individual",
  });
  assert.equal(created.ok, true);
  if (created.ok) {
    assert.equal(created.data.email, "priya@studio.in");
    assert.equal(created.data.userType, "individual");
  }

  const duplicate = await signUp({
    name: "Priya Sharma",
    email: "priya@studio.in",
    password: "GoodPass1",
    confirmPassword: "GoodPass1",
    userType: "individual",
  });
  assert.equal(duplicate.ok, false);

  signOut();
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);

  const badLogin = await signIn({
    email: "priya@studio.in",
    password: "WrongPass1",
  });
  assert.equal(badLogin.ok, false);

  const login = await signIn({
    email: "priya@studio.in",
    password: "GoodPass1",
  });
  assert.equal(login.ok, true);

  const resetRequest = requestPasswordReset("priya@studio.in");
  assert.equal(resetRequest.ok, true);
  if (!resetRequest.ok) return;

  const token = new URL(resetRequest.data.resetUrl, "https://taxease.local").searchParams.get(
    "token"
  );
  assert.ok(token);

  const reset = await resetPassword({
    token,
    password: "NewPass99",
    confirmPassword: "NewPass99",
  });
  assert.equal(reset.ok, true);

  signOut();
  const oldPassword = await signIn({
    email: "priya@studio.in",
    password: "GoodPass1",
  });
  assert.equal(oldPassword.ok, false);

  const newPassword = await signIn({
    email: "priya@studio.in",
    password: "NewPass99",
  });
  assert.equal(newPassword.ok, true);
  assert.ok(storage.getItem(USERS_STORAGE_KEY));
});

test("profile update, password change, and delete account", async () => {
  installMemoryStorage();
  const { updateProfile, changePassword, deleteAccount } = await import("./auth");

  const created = await signUp({
    name: "Arjun Rao",
    email: "arjun@studio.in",
    password: "GoodPass1",
    confirmPassword: "GoodPass1",
    userType: "small_business",
  });
  assert.equal(created.ok, true);

  const profile = updateProfile({
    name: "Arjun Rao",
    userType: "individual",
    pan: "ABCDE1234F",
    phone: "9876543210",
  });
  assert.equal(profile.ok, true);
  if (profile.ok) {
    assert.equal(profile.data.pan, "ABCDE1234F");
    assert.equal(profile.data.phone, "9876543210");
    assert.equal(profile.data.userType, "individual");
  }

  const badPan = updateProfile({
    name: "Arjun Rao",
    userType: "individual",
    pan: "123",
    phone: "",
  });
  assert.equal(badPan.ok, false);

  const password = await changePassword({
    currentPassword: "GoodPass1",
    password: "FreshPass2",
    confirmPassword: "FreshPass2",
  });
  assert.equal(password.ok, true);

  const removed = await deleteAccount("FreshPass2");
  assert.equal(removed.ok, true);

  const login = await signIn({
    email: "arjun@studio.in",
    password: "FreshPass2",
  });
  assert.equal(login.ok, false);
});
