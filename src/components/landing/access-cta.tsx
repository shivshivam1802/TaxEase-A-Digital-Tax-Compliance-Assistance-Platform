import Link from "next/link";
import { ArrowRight, Briefcase, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { USER_TYPES, userTypeDescription } from "@/lib/user-type";
import { cn } from "@/lib/utils";

const typeIcons = {
  individual: UserRound,
  small_business: Briefcase,
} as const;

export function AccessCta() {
  return (
    <section
      id="access"
      aria-labelledby="access-heading"
      className="scroll-mt-24 border-b border-border/70 bg-card/50"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Get started
          </p>
          <h2
            id="access-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            Open an account as an individual or a small business.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Sign-up is live. Choose your filer type so the dashboard, and later
            the calculator, TDS, and ITR modules, open on the right path. You can
            reset a forgotten password in this browser without waiting on email.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-foreground">
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Email and password, hashed before they are stored locally
            </li>
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Individual vs small-business captured at sign-up, not as an afterthought
            </li>
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Working forgot-password flow with a 30-minute reset token
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
          <h3 className="font-heading text-xl font-medium text-foreground">
            Create your account
          </h3>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Pick a path. You can still change details later when profile settings
            ship.
          </p>
          <div className="grid gap-3">
            {USER_TYPES.map((option) => {
              const Icon = typeIcons[option.value];
              return (
                <Link
                  key={option.value}
                  href={`/signup?type=${option.value}`}
                  className="flex items-start gap-3 rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                      {userTypeDescription(option.value)}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-3"
            >
              Sign in
            </Link>
          </p>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "mt-5 h-11 w-full px-4")}
          >
            Continue to sign up
          </Link>
        </div>
      </div>
    </section>
  );
}
