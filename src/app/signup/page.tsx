import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { RedirectIfSignedIn } from "@/components/auth/auth-gates";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a TaxEase account as an individual or small business.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <RedirectIfSignedIn>
      <AuthShell
        title="Create your account"
        description="Choose how you file, then set an email and password. This becomes the profile the tax modules will attach to."
        headerAction={{ href: "/login", label: "Sign in" }}
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-3">
              Sign in
            </Link>
          </>
        }
      >
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
          <SignUpForm initialUserType={type ?? ""} />
        </Suspense>
      </AuthShell>
    </RedirectIfSignedIn>
  );
}
