"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNextPath, type FieldErrors } from "@/lib/auth";

export function SignInForm() {
  const formId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = await signIn(values);
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
        <Label htmlFor={`${formId}-email`}>Email</Label>
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onValueChange={(email) => setValues((current) => ({ ...current, email }))}
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

      <PasswordField
        id={`${formId}-password`}
        label="Password"
        autoComplete="current-password"
        placeholder="Your password"
        value={values.password}
        onValueChange={(password) => setValues((current) => ({ ...current, password }))}
        error={errors.password}
        action={
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary underline-offset-3 hover:underline"
          >
            Forgot password?
          </Link>
        }
      />

      {errors.form ? (
        <p
          id={`${formId}-form-error`}
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full px-4" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
