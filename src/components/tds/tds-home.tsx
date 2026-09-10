"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { TdsEntryForm } from "@/components/tds/tds-entry-form";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/money";
import { FY_2026_27 } from "@/lib/tax-rules";
import {
  removeTds,
  setTdsReturnStatus,
  yearOverview,
  type TdsEntry,
  type TdsKind,
} from "@/lib/tax-store";
import {
  TDS_RETURN_STATUSES,
  type TdsQuarterId,
  type TdsReturnStatus,
} from "@/lib/tds-rules";
import {
  depositDueOn,
  normalizeTds,
  returnsFor,
  sectionLabel,
  tdsKindLabel,
  tdsOverview,
} from "@/lib/tds";
import { cn } from "@/lib/utils";

type Filter = "all" | TdsKind | "overdue";
type Panel = { mode: "add"; kind?: TdsKind } | { mode: "edit"; entry: TdsEntry } | null;

export function TdsHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [panel, setPanel] = useState<Panel>(null);

  const overview = useMemo(() => yearOverview(year), [year]);
  const tds = useMemo(
    () => tdsOverview(year.tds, overview.computation?.totalTax ?? null),
    [overview.computation, year.tds]
  );
  const quarters = useMemo(() => returnsFor(year), [year]);
  const today = new Date().toISOString().slice(0, 10);

  const lines = year.tds.map(normalizeTds).filter((line) => {
    if (filter === "all") return true;
    if (filter === "overdue") {
      return (
        line.kind === "received" &&
        line.depositStatus === "pending" &&
        depositDueOn(line.on) < today
      );
    }
    return line.kind === filter;
  });

  if (!user) return null;

  const isBusiness = user.userType === "small_business";

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            TDS ledger
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {FY_2026_27.label} TDS
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isBusiness
              ? "Track credit on your receipts and tax you deduct from payees — including deposit by the 7th and quarterly 26Q / 24Q."
              : "Record TDS credited to you from salary, interest, and clients. If you also deduct tax as a proprietor, log those lines as “You deducted”."}
          </p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={() => setPanel({ mode: "add" })}>
          <Plus /> Add line
        </Button>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="TDS credit"
          value={formatINR(tds.deducted)}
          hint="Withheld from you — reduces tax payable"
        />
        <Stat
          label="You deducted"
          value={formatINR(tds.collected)}
          hint={
            tds.pendingDeposit
              ? `${formatINR(tds.pendingDeposit)} still to deposit`
              : "Tax withheld from payees"
          }
        />
        <Stat
          label="Still payable"
          value={tds.remaining === null ? "—" : formatINR(tds.remaining)}
          hint={
            overview.computation
              ? `${tds.covered}% of estimated tax covered`
              : "Record income to reconcile"
          }
        />
        <Stat
          label="Overdue deposits"
          value={String(tds.overdue.length)}
          hint={tds.overdue.length ? "Due on the 7th of the next month" : "No pending overdue challans"}
        />
      </section>

      {overview.computation ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Estimated tax {formatINR(overview.computation.totalTax)} · credit{" "}
          {formatINR(tds.deducted)} · still payable{" "}
          {formatINR(tds.remaining ?? 0)}.{" "}
          <Link href="/calculator" className="font-medium text-foreground underline underline-offset-3">
            Recalculate
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No income snapshot yet, so payable tax cannot be reconciled.{" "}
          <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-3">
            Record income
          </Link>
        </p>
      )}

      {tds.overdue.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Deposit overdue</p>
          <ul className="mt-2 space-y-1 text-sm">
            {tds.overdue.map((line) => (
              <li key={line.id}>
                {line.source} · {formatINR(line.amount)} · due {formatDue(depositDueOn(line.on))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["deducted", "Credit"],
            ["received", "You deducted"],
            ["overdue", "Overdue"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            variant={filter === id ? "default" : "outline"}
            className="h-10 px-4"
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-lg font-medium">Ledger</h2>
        </div>
        {lines.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {year.tds.length === 0
              ? "Nothing on the ledger yet. Add a Form 16 / 26AS credit, or a line you deducted from a payee."
              : "No lines match this filter."}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {lines.map((line) => {
              const due = line.kind === "received" ? depositDueOn(line.on) : null;
              const overdue =
                due !== null &&
                line.depositStatus === "pending" &&
                due < today;
              return (
                <li
                  key={line.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.source}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tdsKindLabel(line.kind)} · {sectionLabel(line.section)} · {formatDue(line.on)}
                      {line.pan ? ` · ${line.pan}` : ""}
                    </p>
                    {due && line.kind === "received" ? (
                      <p className={cn("mt-1 text-xs", overdue && "text-destructive")}>
                        {line.depositStatus === "deposited"
                          ? `Deposited ${line.depositedOn ? formatDue(line.depositedOn) : ""}`
                          : `Deposit due ${formatDue(due)}`}
                      </p>
                    ) : null}
                    {line.note ? (
                      <p className="mt-1 text-xs text-muted-foreground">{line.note}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {overdue ? <Badge variant="destructive">Overdue</Badge> : null}
                    <span className="text-sm font-medium">{formatINR(line.amount)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${line.source}`}
                      onClick={() =>
                        setPanel({
                          mode: "edit",
                          entry: year.tds.find((item) => item.id === line.id)!,
                        })
                      }
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${line.source}`}
                      onClick={() => removeTds(user.id, line.id, year.fyId)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-medium">Quarterly TDS returns</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Status only — filing 26Q / 24Q on the TRACES portal is still done
          there. Mark a quarter filed once the acknowledgement is with you.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {quarters.map((quarter) => {
            const overdue = quarter.status === "not_started" && quarter.dueOn < today;
            return (
              <li key={quarter.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {quarter.label} · {quarter.period}
                    </p>
                    <p className="text-xs text-muted-foreground">{quarter.formHint}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      overdue
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {overdue ? "Overdue" : formatDue(quarter.dueOn)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TDS_RETURN_STATUSES.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={quarter.status === option.value ? "default" : "outline"}
                      className="h-8"
                      onClick={() =>
                        setTdsReturnStatus(
                          user.id,
                          quarter.id as TdsQuarterId,
                          option.value as TdsReturnStatus,
                          year.fyId
                        )
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-11 px-4")}
      >
        Back to dashboard
      </Link>

      <Sheet open={panel !== null} onOpenChange={(open) => !open && setPanel(null)}>
        <SheetContent side="right" className="w-[min(100%,28rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{panel?.mode === "edit" ? "Edit TDS line" : "Add TDS line"}</SheetTitle>
            <SheetDescription>
              Credit reduces tax still payable. Lines you deducted need a
              deposit by the 7th of the next month.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {panel?.mode === "add" ? (
              <TdsEntryForm
                key="add"
                userId={user.id}
                fyId={year.fyId}
                defaultKind={panel.kind}
                onSaved={() => setPanel(null)}
              />
            ) : null}
            {panel?.mode === "edit" ? (
              <TdsEntryForm
                key={panel.entry.id}
                userId={user.id}
                fyId={year.fyId}
                entry={panel.entry}
                onSaved={() => setPanel(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Stat({
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

function formatDue(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
