"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  CalendarDays,
  FileText,
  FolderClosed,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { EstimateForm } from "@/components/dashboard/estimate-form";
import { ItrStatusForm } from "@/components/dashboard/itr-status-form";
import { TdsForm } from "@/components/dashboard/tds-form";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/money";
import { FY_2026_27, STATUTORY_DEADLINES } from "@/lib/tax-rules";
import {
  ITR_STATUSES,
  removeTds,
  yearOverview,
  type ItrStatus,
  type TaxYearRecord,
} from "@/lib/tax-store";
import { userTypeLabel } from "@/lib/user-type";
import { cn } from "@/lib/utils";

type Panel = "estimate" | "tds" | "itr" | null;

export function DashboardHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [panel, setPanel] = useState<Panel>(null);

  const overview = useMemo(() => yearOverview(year), [year]);
  const nextDeadlines = useMemo(() => upcomingDeadlines(user?.userType ?? "individual"), [user?.userType]);

  if (!user) return null;

  const itrLabel = ITR_STATUSES.find((item) => item.value === year.itrStatus)?.label ?? "Not started";

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {user.name.split(" ")[0]}’s {FY_2026_27.label}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {userTypeLabel(user.userType)} · {FY_2026_27.assessmentYear} · new regime
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Rules: {FY_2026_27.source}
        </p>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Estimated tax"
          value={overview.computation ? formatINR(overview.computation.totalTax) : "—"}
          hint={overview.computation ? "After 87A rebate and cess" : "Record income to estimate"}
        />
        <StatCard
          label="TDS deducted"
          value={formatINR(overview.tdsDeducted)}
          hint={overview.tdsReceived ? `Received ${formatINR(overview.tdsReceived)}` : "Credit already withheld"}
        />
        <StatCard
          label="Still payable"
          value={overview.remaining === null ? "—" : formatINR(overview.remaining)}
          hint="Estimate minus TDS deducted"
        />
        <StatCard
          label="ITR status"
          value={itrLabel}
          hint={
            nextDeadlines[0]
              ? `Next: ${nextDeadlines[0].title}`
              : "No upcoming statutory date"
          }
        />
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <EstimateCard
          computation={overview.computation}
          onEdit={() => setPanel("estimate")}
        />
        <TdsCard
          year={year}
          deducted={overview.tdsDeducted}
          remaining={overview.remaining}
          userId={user.id}
          onAdd={() => setPanel("tds")}
        />
        <ItrCard status={year.itrStatus} onEdit={() => setPanel("itr")} />
        <DeadlinesCard items={nextDeadlines} />
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <FolderClosed className="mt-0.5 size-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-lg font-medium">Recent documents</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Nothing on file yet. Upload, categorise, and download will arrive
              in the document vault — this card will list the latest items then.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-medium">Quick actions</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button type="button" className="h-11 justify-start px-4" onClick={() => setPanel("estimate")}>
            <Wallet /> Record income
          </Button>
          <Button type="button" variant="outline" className="h-11 justify-start px-4" onClick={() => setPanel("tds")}>
            <Receipt /> Add TDS
          </Button>
          <Button type="button" variant="outline" className="h-11 justify-start px-4" onClick={() => setPanel("itr")}>
            <FileText /> Update ITR status
          </Button>
          <Link
            href="/calculator"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 justify-start px-4")}
          >
            <Calculator /> Tax calculator
          </Link>
        </div>
      </section>

      <Sheet open={panel !== null} onOpenChange={(open) => !open && setPanel(null)}>
        <SheetContent side="right" className="w-[min(100%,26rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {panel === "estimate"
                ? "Record income"
                : panel === "tds"
                  ? "Add TDS"
                  : "ITR status"}
            </SheetTitle>
            <SheetDescription>
              {panel === "estimate"
                ? "Saved against this financial year and used by the estimate."
                : panel === "tds"
                  ? "Deducted credit reduces tax still payable."
                  : "Status only — filing assistance is a later module."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {panel === "estimate" ? (
              <EstimateForm
                userId={user.id}
                userType={user.userType}
                year={year}
                onSaved={() => setPanel(null)}
              />
            ) : null}
            {panel === "tds" ? (
              <TdsForm
                userId={user.id}
                fyId={year.fyId}
                onSaved={() => setPanel(null)}
              />
            ) : null}
            {panel === "itr" ? (
              <ItrStatusForm
                userId={user.id}
                fyId={year.fyId}
                current={year.itrStatus}
                onSaved={() => setPanel(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-heading text-2xl text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function EstimateCard({
  computation,
  onEdit,
}: {
  computation: ReturnType<typeof yearOverview>["computation"];
  onEdit: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-medium">Estimated tax</h2>
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={onEdit}>
          <Pencil /> {computation ? "Edit" : "Record"}
        </Button>
      </div>
      {computation ? (
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Gross income" value={formatINR(computation.grossIncome)} />
          <Row label="Standard deduction" value={formatINR(computation.standardDeduction)} />
          <Row label="Other deductions" value={formatINR(computation.otherDeductions)} />
          <Row label="Taxable income" value={formatINR(computation.taxableIncome)} />
          <Row label="Slab tax" value={formatINR(computation.slabTax)} />
          <Row label="s.87A rebate" value={formatINR(computation.rebate87A)} />
          {computation.surcharge > 0 ? (
            <Row label="Surcharge" value={formatINR(computation.surcharge)} />
          ) : null}
          <Row label="Cess 4%" value={formatINR(computation.cess)} />
          <Row label="Total" value={formatINR(computation.totalTax)} strong />
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No income recorded for this year. Add salary, business, or other
          income to compute tax from the FY 2026–27 new-regime slabs, or open
          the calculator to compare regimes.
        </p>
      )}
      <Link
        href="/calculator"
        className="mt-4 inline-block text-sm font-medium text-primary underline-offset-3 hover:underline"
      >
        Compare new vs old regime
      </Link>
    </article>
  );
}

function TdsCard({
  year,
  deducted,
  remaining,
  userId,
  onAdd,
}: {
  year: TaxYearRecord;
  deducted: number;
  remaining: number | null;
  userId: string;
  onAdd: () => void;
}) {
  const covered =
    remaining === null || remaining + deducted === 0
      ? 0
      : Math.min(100, Math.round((deducted / (deducted + remaining)) * 100));

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-medium">TDS summary</h2>
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={onAdd}>
          <Plus /> Add
        </Button>
      </div>
      {year.tds.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No TDS lines yet. Record tax deducted at source (Form 16 / 26AS) so
          payable tax on the overview stays honest.
        </p>
      ) : (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${covered}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {covered}% of estimated tax covered by TDS deducted
          </p>
          <ul className="mt-3 space-y-2">
            {year.tds.slice(0, 4).map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.source}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.kind === "deducted" ? "Deducted" : "Received"} · {entry.on}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{formatINR(entry.amount)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete TDS from ${entry.source}`}
                    onClick={() => removeTds(userId, entry.id, year.fyId)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

function ItrCard({
  status,
  onEdit,
}: {
  status: ItrStatus;
  onEdit: () => void;
}) {
  const label = ITR_STATUSES.find((item) => item.value === status)?.label ?? status;
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-medium">ITR status</h2>
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={onEdit}>
          Update
        </Button>
      </div>
      <p className="mt-3 font-heading text-2xl">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {status === "not_started"
          ? "The return has not been started. Income and TDS on this dashboard will feed the filing assistant when it ships."
          : "Status is stored with this year. The step-by-step filing assistant is a later module."}
      </p>
    </article>
  );
}

function DeadlinesCard({
  items,
}: {
  items: ReturnType<typeof upcomingDeadlines>;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        <h2 className="font-heading text-lg font-medium">Upcoming deadlines</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">No statutory dates remaining this year.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  item.overdue
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {item.overdue ? "Overdue" : formatDue(item.dueOn)}
              </span>
            </li>
          ))
        )}
      </ul>
    </article>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-3", strong && "pt-2 font-medium")}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function upcomingDeadlines(userType: "individual" | "small_business") {
  const today = new Date().toISOString().slice(0, 10);
  return STATUTORY_DEADLINES.filter(
    (item) => item.appliesTo === "all" || item.appliesTo === userType
  )
    .map((item) => ({ ...item, overdue: item.dueOn < today }))
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn))
    .filter((item) => item.overdue || item.dueOn >= today)
    .slice(0, 4);
}

function formatDue(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
