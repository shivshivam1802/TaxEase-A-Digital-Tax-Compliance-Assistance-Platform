"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { PasswordField } from "@/components/auth/password-field";
import { UserTypePicker } from "@/components/auth/user-type-picker";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isUserType, type UserType } from "@/lib/user-type";
import { safeNextPath, type FieldErrors } from "@/lib/auth";

export function SignUpForm({ initialUserType = "" }: { initialUserType?: string }) {
  const formId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const nextPath = safeNextPath(searchParams.get("next"));
  const presetType = isUserType(initialUserType) ? initialUserType : "";

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: presetType as "" | UserType,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = await signUp({
      name: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      userType: values.userType,
    });

    if (!result.ok) {
      setSubmitting(false);
      setErrors(result.errors);
      return;
    }

    router.push(nextPath);
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={errors.form ? `${formId}-form-error` : undefined}
    >
      <div className="space-y-2">
        <Label htmlFor={`${formId}-name`}>Full name</Label>
        <Input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          onValueChange={(value) => setValues((current) => ({ ...current, name: value }))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          placeholder="e.g. Afnan Tufail"
          className="h-11 px-3"
        />
        {errors.name ? (
          <p id={`${formId}-name-error`} className="text-sm text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-email`}>Email</Label>
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onValueChange={(value) => setValues((current) => ({ ...current, email: value }))}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          placeholder="you@studio.in"
          className="h-11 px-3"
        />
        {errors.email ? (
          <p id={`${formId}-email-error`} className="text-sm text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <UserTypePicker
        value={values.userType}
        onChange={(userType) => setValues((current) => ({ ...current, userType }))}
        error={errors.userType}
      />

      <PasswordField
        id={`${formId}-password`}
        label="Password"
        autoComplete="new-password"
        value={values.password}
        onValueChange={(password) => setValues((current) => ({ ...current, password }))}
        error={errors.password}
      />

      <PasswordField
        id={`${formId}-confirm`}
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter password"
        value={values.confirmPassword}
        onValueChange={(confirmPassword) =>
          setValues((current) => ({ ...current, confirmPassword }))
        }
        error={errors.confirmPassword}
      />

      {errors.form ? (
        <p
          id={`${formId}-form-error`}
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}{" "}
          {errors.email === "An account already exists for this email." ? (
            <Link href="/login" className="font-medium underline underline-offset-3">
              Sign in
            </Link>
          ) : null}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full px-4" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Creating account
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
