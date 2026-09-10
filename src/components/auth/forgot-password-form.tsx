"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheck, LoaderCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FieldErrors } from "@/lib/auth";

export function ForgotPasswordForm() {
  const formId = useId();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    email: string;
    resetUrl: string;
    expiresAt: string;
  } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);
    const response = requestPasswordReset(email);
    setSubmitting(false);

    if (!response.ok) {
      setErrors(response.errors);
      return;
    }

    setResult(response.data);
  }

  if (result) {
    const expires = new Date(result.expiresAt);
    return (
      <div role="status" className="space-y-4">
        <CircleCheck className="size-8 text-primary" aria-hidden="true" />
        <div>
          <h3 className="font-heading text-2xl font-medium text-foreground">
            Reset link ready
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No email is sent in this local build. Use the link below for{" "}
            <span className="font-medium text-foreground">{result.email}</span>.
            It expires at {expires.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
          </p>
        </div>
        <Link
          href={result.resetUrl}
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full px-4")}
        >
          Continue to reset password
        </Link>
        <p className="text-xs text-muted-foreground">
          In production this would arrive by email. The token is stored only in
          this browser.
        </p>
      </div>
    );
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
          value={email}
          onValueChange={setEmail}
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

      {errors.form ? (
        <p
          id={`${formId}-form-error`}
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}{" "}
          <Link href="/signup" className="font-medium underline underline-offset-3">
            Create an account
          </Link>
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full px-4" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Checking account
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
