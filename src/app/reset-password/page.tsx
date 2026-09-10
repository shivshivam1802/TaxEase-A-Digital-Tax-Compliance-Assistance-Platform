import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Niyam account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a password with at least eight characters, including a letter and a number. You will be signed in after it saves."
      headerAction={{ href: "/login", label: "Sign in" }}
      asideTitle="One link, one change."
      asideBody="The token in this URL is checked against the account store. Used or expired links must be requested again."
      footer={
        <>
          Need a new link?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline underline-offset-3"
          >
            Forgot password
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
