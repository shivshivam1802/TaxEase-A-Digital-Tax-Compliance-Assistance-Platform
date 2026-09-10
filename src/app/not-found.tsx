import Link from "next/link";

import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center"
      >
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          404
        </p>
        <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight">
          This page is not on the return.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The address does not match a published page. Head home, or jump to the
          access form if you meant to join the waitlist.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
            Back to home
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-5"
            )}
          >
            Create account
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
