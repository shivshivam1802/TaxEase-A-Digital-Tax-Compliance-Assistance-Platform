import Link from "next/link";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border/70"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.08_145_/_0.18),transparent_45%),radial-gradient(ellipse_at_bottom_left,oklch(0.82_0.06_85_/_0.22),transparent_40%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            For AY 2026–27 · Individuals &amp; small businesses
          </p>
          <h1
            id="hero-heading"
            className="font-heading text-[2.35rem] leading-[1.12] font-medium tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.35rem]"
          >
            {site.name}
          </h1>
          <p className="mt-3 font-heading text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {site.tagline}
          </p>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {site.name} brings income tax, ITR assistance, TDS, documents, and
            due dates into one workspace — so filing season is a review, not a
            reconstruction.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              Create account
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              See how it works
              <ArrowDown data-icon="inline-end" />
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/80 pt-6 sm:max-w-lg">
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                Coverage
              </dt>
              <dd className="mt-1 font-heading text-lg text-foreground sm:text-xl">
                ITR + TDS
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                Designed for
              </dt>
              <dd className="mt-1 font-heading text-lg text-foreground sm:text-xl">
                IN tax year
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                Support
              </dt>
              <dd className="mt-1 font-heading text-lg text-foreground sm:text-xl">
                CA desk
              </dd>
            </div>
          </dl>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <aside
      aria-label="Product preview of a tax overview"
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_24px_80px_-32px_oklch(0.3_0.04_160_/_0.45)] sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              FY 2026–27 overview
            </p>
            <p className="mt-1 font-heading text-lg text-foreground">
              Afnan Tufail · Individual
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            On track
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewStat label="Estimated tax" value="₹1,24,800" hint="New regime" />
          <PreviewStat label="TDS already paid" value="₹86,400" hint="Form 26AS" />
        </div>

        <div className="mt-3 rounded-xl bg-secondary/80 p-3.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Remaining payable
          </p>
          <p className="mt-1 font-heading text-2xl text-foreground">₹38,400</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full w-[69%] rounded-full bg-primary"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            69% covered by TDS · Advance tax due 15 Jun
          </p>
        </div>

        <ul className="mt-4 space-y-2.5">
          <PreviewRow
            title="ITR-1 not started"
            meta="Documents: 3 of 5 uploaded"
          />
          <PreviewRow title="TDS Q4 unmatched" meta="₹12,000 to reconcile" />
          <PreviewRow
            title="80C room remaining"
            meta="₹28,000 before 31 Mar"
          />
        </ul>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Illustrative snapshot — live calculations arrive in the calculator
        module.
      </p>
    </aside>
  );
}

function PreviewStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-background px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function PreviewRow({ title, meta }: { title: string; meta: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <span
        className="size-2 shrink-0 rounded-full bg-primary/70"
        aria-hidden="true"
      />
    </li>
  );
}
