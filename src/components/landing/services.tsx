import {
  Calculator,
  CalendarDays,
  FileCheck,
  FolderClosed,
  Receipt,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { services } from "@/lib/site";

const icons: Record<(typeof services)[number]["icon"], LucideIcon> = {
  calculator: Calculator,
  "file-check": FileCheck,
  receipt: Receipt,
  calendar: CalendarDays,
  folder: FolderClosed,
  users: Users,
};

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-24 border-b border-border/70 bg-card/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Main services
          </p>
          <h2
            id="services-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            Everything a filing year actually requires.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Six modules, one record. Calculator, TDS, ITR, documents, calendar,
            and CA desk all share the same year file once you sign in.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon];
            return (
              <li
                key={service.id}
                className="flex h-full flex-col rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
