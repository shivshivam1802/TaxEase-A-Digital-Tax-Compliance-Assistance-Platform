"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { RequireAuth } from "@/components/auth/auth-gates";
import { useAuth } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/app/app-shell";
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
    <AppShell>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
        Account
      </p>
      <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
        {user.name}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Session details for this browser. Profile and security settings ship in
        a later module.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Email</dt>
            <dd className="mt-1 text-sm font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Filing as</dt>
            <dd className="mt-1 text-sm font-medium">{userTypeLabel(user.userType)}</dd>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {userTypeDescription(user.userType)}
            </p>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted-foreground uppercase">Created</dt>
            <dd className="mt-1 text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}>
            Back to dashboard
          </Link>
          <Button type="button" variant="outline" className="h-11 px-4" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
