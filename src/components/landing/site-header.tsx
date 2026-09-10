"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSignOut() {
    signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled
          ? "border-border/80 bg-background/90 backdrop-blur-md"
          : "border-transparent bg-background/70 backdrop-blur-sm"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Logo href="/" />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {ready && user ? (
            <>
              <Link
                href="/account"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 px-4"
                )}
              >
                Account
              </Link>
              <Button type="button" className="h-10 px-4" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 px-4"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Jump to a section or sign in to Niyam.
              </SheetDescription>
              <Logo href="/" />
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
              {navItems.map((item) => (
                <SheetClose
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              {ready && user ? (
                <>
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/account"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "h-11 w-full px-4"
                        )}
                      />
                    }
                  >
                    Account
                  </SheetClose>
                  <Button type="button" className="h-11 w-full px-4" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/login"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "h-11 w-full px-4"
                        )}
                      />
                    }
                  >
                    Sign in
                  </SheetClose>
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/signup"
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "h-11 w-full px-4"
                        )}
                      />
                    }
                  >
                    Create account
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
