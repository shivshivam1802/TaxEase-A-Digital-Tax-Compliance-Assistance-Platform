import { Eye, Lock, Scale, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { site, trustPoints } from "@/lib/site";

const icons: Record<(typeof trustPoints)[number]["icon"], LucideIcon> = {
  lock: Lock,
  eye: Eye,
  scale: Scale,
  shield: Shield,
};

export function Trust() {
  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="scroll-mt-24 border-b border-border/70"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
              Trust &amp; security
            </p>
            <h2
              id="security-heading"
              className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
            >
              Your return is a confidential financial record. Treat it that way.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {site.name} is designed so that tax data can move to a real backend
              without changing how the product thinks about access, purpose, and
              retention. Early access requests stay in your browser until a
              server is connected.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {trustPoints.map((point) => {
              const Icon = icons[point.icon];
              return (
                <li
                  key={point.title}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-heading text-lg font-medium text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {point.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
