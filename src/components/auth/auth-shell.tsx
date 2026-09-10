import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  asideTitle?: string;
  asideBody?: string;
  headerAction?: { href: string; label: string };
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  asideTitle = "A filing year you can actually finish.",
  asideBody = "Create an individual or small-business account. The tax workspace — calculator, TDS, ITR, documents — ships next, on top of this session.",
  headerAction,
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
          <Logo href="/" />
          {headerAction ? (
            <Link
              href={headerAction.href}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
            >
              {headerAction.label}
            </Link>
          ) : null}
        </div>
      </header>

      <main
        id="main"
        className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <aside className="hidden bg-[oklch(0.27_0.035_160)] p-10 text-[oklch(0.97_0.01_95)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-[oklch(0.86_0.08_85)] uppercase">
              {site.name}
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-tight font-medium tracking-tight text-balance">
              {asideTitle}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              {asideBody}
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li>Individual and small-business paths</li>
            <li>Passwords hashed in the browser until a server exists</li>
            <li>Reset links work without an email provider in this build</li>
          </ul>
        </aside>

        <section className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
