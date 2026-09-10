import { Check } from "lucide-react";

import { benefits, site } from "@/lib/site";

export function Benefits() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="scroll-mt-24 border-b border-border/70"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Why {site.name}
          </p>
          <h2
            id="benefits-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            Built like a finance product. Written like a tax file.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The point is not more screens. It is a year of tax work that stays
            accurate, complete, and ready for a professional review.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="size-4" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-medium text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
