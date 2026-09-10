import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfSignedIn } from "@/components/auth/auth-gates";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Niyam account.",
};

export default function LoginPage() {
  return (
    <RedirectIfSignedIn>
      <AuthShell
        title="Sign in"
        description="Use the email and password you created. Forgot it? Reset it in this browser — no inbox required in this build."
        headerAction={{ href: "/signup", label: "Create account" }}
        asideTitle="Welcome back."
        asideBody="Your account type — individual or small business — is already on file. The workspace modules will read it when they ship."
        footer={
          <>
            New to Niyam?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-3">
              Create an account
            </Link>
          </>
        }
      >
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
          <SignInForm />
        </Suspense>
      </AuthShell>
    </RedirectIfSignedIn>
  );
}
