"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { FieldErrors } from "@/lib/auth";

export function ResetPasswordForm() {
  const formId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword } = useAuth();

  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors>(
    token ? {} : { form: "This reset link is missing a token. Request a new one." }
  );
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = await resetPassword({
      token,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    if (!result.ok) {
      setSubmitting(false);
      setErrors(result.errors);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={errors.form ? `${formId}-form-error` : undefined}
    >
      <PasswordField
        id={`${formId}-password`}
        label="New password"
        autoComplete="new-password"
        value={values.password}
        onValueChange={(password) => setValues((current) => ({ ...current, password }))}
        error={errors.password}
      />
      <PasswordField
        id={`${formId}-confirm`}
        label="Confirm new password"
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
          <Link
            href="/forgot-password"
            className="font-medium underline underline-offset-3"
          >
            Request a new link
          </Link>
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full px-4"
        disabled={submitting || !token}
      >
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Updating password
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
