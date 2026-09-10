import type { ReactNode } from "react";

import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/site-header";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Legal
          </p>
          <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated {updated}
          </p>
          <div className="mt-8 space-y-5 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground [&_p]:max-w-prose">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
