"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePassword,
  deleteAccount,
  updateProfile,
  type FieldErrors,
} from "@/lib/auth";
import { USER_TYPES, userTypeDescription } from "@/lib/user-type";

export function SettingsHome() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <AppShell>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
        Settings
      </p>
      <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
        Profile and data
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Name, filer type, PAN, and password for this browser account. Export or
        delete everything stored locally.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
        <ExportCard />
        <DeleteCard
          email={user.email}
          onDeleted={() => {
            signOut();
          }}
        />
      </div>
    </AppShell>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [userType, setUserType] = useState(user?.userType ?? "individual");
  const [pan, setPan] = useState(user?.pan ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    const result = updateProfile({ name, userType, pan, phone });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaved(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="font-heading text-xl font-medium">Profile</h2>
      <div className="mt-4 space-y-3">
        <Field
          id="set-name"
          label="Full name"
          value={name}
          error={errors.name}
          onChange={setName}
        />
        <div className="space-y-1.5">
          <Label htmlFor="set-type">Filing as</Label>
          <select
            id="set-type"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={userType}
            onChange={(event) =>
              setUserType(event.target.value as typeof userType)
            }
          >
            {USER_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {userTypeDescription(userType)}
          </p>
        </div>
        <Field
          id="set-pan"
          label="PAN (optional)"
          value={pan}
          error={errors.pan}
          onChange={(value) => setPan(value.toUpperCase())}
          className="uppercase"
        />
        <Field
          id="set-phone"
          label="Mobile (optional)"
          value={phone}
          error={errors.phone}
          onChange={setPhone}
          inputMode="numeric"
        />
        {errors.form ? (
          <p className="text-sm text-destructive">{errors.form}</p>
        ) : null}
        {saved ? (
          <p className="text-sm text-primary">Profile saved on this browser.</p>
        ) : null}
        <Button type="submit" className="h-11 w-full">
          Save profile
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    const result = await changePassword({
      currentPassword,
      password,
      confirmPassword,
    });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="font-heading text-xl font-medium">Password</h2>
      <div className="mt-4 space-y-3">
        <Field
          id="set-current"
          label="Current password"
          value={currentPassword}
          error={errors.currentPassword}
          onChange={setCurrentPassword}
          type="password"
        />
        <Field
          id="set-new"
          label="New password"
          value={password}
          error={errors.password}
          onChange={setPassword}
          type="password"
        />
        <Field
          id="set-confirm"
          label="Confirm new password"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={setConfirmPassword}
          type="password"
        />
        {errors.form ? (
          <p className="text-sm text-destructive">{errors.form}</p>
        ) : null}
        {saved ? (
          <p className="text-sm text-primary">Password updated.</p>
        ) : null}
        <Button type="submit" className="h-11 w-full" disabled={busy}>
          Change password
        </Button>
      </div>
    </form>
  );
}

function ExportCard() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);

  function download() {
    if (!user) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: user,
      year,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `niyam-${user.email.replace(/[^a-z0-9]+/gi, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-xl font-medium">Export</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Download a JSON copy of your public profile and this year’s tax file,
        including document attachments stored as data URLs. Passwords are not
        included.
      </p>
      <Button type="button" variant="outline" className="mt-4 h-11" onClick={download}>
        Download JSON
      </Button>
    </div>
  );
}

function DeleteCard({
  email,
  onDeleted,
}: {
  email: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (confirm.trim().toLowerCase() !== email) {
      setErrors({ form: "Type your email address to confirm deletion." });
      return;
    }
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onDeleted();
    router.push("/");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6"
    >
      <h2 className="font-heading text-xl font-medium text-destructive">
        Delete account
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Removes this login, session, and FY records from this browser. This
        cannot be undone.
      </p>
      <div className="mt-4 space-y-3">
        <Field
          id="del-email"
          label={`Type ${email} to confirm`}
          value={confirm}
          onChange={setConfirm}
        />
        <Field
          id="del-pass"
          label="Password"
          value={password}
          error={errors.password}
          onChange={setPassword}
          type="password"
        />
        {errors.form ? (
          <p className="text-sm text-destructive">{errors.form}</p>
        ) : null}
        <Button
          type="submit"
          variant="destructive"
          className="h-11 w-full"
          disabled={busy}
        >
          Delete this account
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  className,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  className?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        className={`h-10 ${className ?? ""}`}
        value={value}
        inputMode={inputMode}
        onValueChange={onChange}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
