"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const appNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calculator", label: "Calculator" },
  { href: "/account", label: "Account" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function handleSignOut() {
    signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
          <Logo href="/dashboard" />
          <nav aria-label="Workspace" className="hidden items-center gap-1 md:flex">
            {appNav.map((item) => {
              const current = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                    current ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <p className="max-w-[12rem] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            ) : null}
            <Button type="button" variant="outline" className="h-10 px-4" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[min(100%,20rem)]">
          <SheetHeader>
            <SheetTitle className="sr-only">Workspace menu</SheetTitle>
            <SheetDescription className="sr-only">
              Dashboard, calculator, and account
            </SheetDescription>
            <Logo href="/dashboard" />
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {appNav.map((item) => {
              const current = pathname === item.href;
              return (
                <SheetClose
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary",
                        current && "bg-secondary"
                      )}
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              );
            })}
          </nav>
          <div className="mt-auto p-4">
            <Button type="button" className="h-11 w-full" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
