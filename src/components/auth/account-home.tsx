"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { RequireAuth } from "@/components/auth/auth-gates";
import { useAuth } from "@/components/auth/auth-provider";
import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { userTypeDescription, userTypeLabel } from "@/lib/user-type";
import { cn } from "@/lib/utils";

export function AccountHome() {
  return (
    <RequireAuth>
      <SignedInAccount />
    </RequireAuth>
  );
}

function SignedInAccount() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  function onSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Signed in
          </p>
          <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight text-foreground">
            Hello, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Your account is active. The tax workspace — dashboard, calculator,
            TDS, and ITR assistance — is the next module and is not built yet.
            This page only confirms the session.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-heading text-xl font-medium text-foreground">
              Account
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                  Email
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                  Filing as
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {userTypeLabel(user.userType)}
                </dd>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {userTypeDescription(user.userType)}
                </p>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                  Created
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="h-11 px-4" onClick={onSignOut}>
                Sign out
              </Button>
              <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}>
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
