"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/account");
      router.replace(`/login?next=${next}`);
    }
  }, [pathname, ready, router, user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) {
      router.replace("/account");
    }
  }, [ready, router, user]);

  if (!ready || user) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          {user ? "You are already signed in…" : "Loading…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
