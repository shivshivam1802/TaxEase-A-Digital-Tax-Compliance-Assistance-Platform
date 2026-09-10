import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfSignedIn } from "@/components/auth/auth-gates";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Generate a local password reset link for your TaxEase account.",
};

export default function ForgotPasswordPage() {
  return (
    <RedirectIfSignedIn>
      <AuthShell
        title="Forgot password"
        description="Enter the email on your account. Because this build has no mail server, a one-time reset link is shown on the next screen."
        headerAction={{ href: "/login", label: "Sign in" }}
        asideTitle="Recover access without a mailbox."
        asideBody="Reset tokens live in this browser for 30 minutes. Production will send the same link by email."
        footer={
          <>
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-3">
              Sign in
            </Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthShell>
    </RedirectIfSignedIn>
  );
}
