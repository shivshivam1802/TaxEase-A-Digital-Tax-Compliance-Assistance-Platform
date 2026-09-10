"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR, rupeesInput } from "@/lib/money";
import { percentFromRate, suggestedTds } from "@/lib/tds";
import { TDS_SECTIONS, getTdsSection, type TdsSection } from "@/lib/tds-rules";
import {
  addTds,
  updateTds,
  validateTdsInput,
  type TdsDepositStatus,
  type TdsEntry,
  type TdsKind,
} from "@/lib/tax-store";
import { cn } from "@/lib/utils";

type FormValues = {
  kind: TdsKind;
  section: TdsSection;
  amount: string;
  source: string;
  on: string;
  paymentAmount: string;
  ratePercent: string;
  pan: string;
  note: string;
  depositStatus: TdsDepositStatus;
  depositedOn: string;
};

function valuesFromEntry(entry?: TdsEntry): FormValues {
  const section = entry?.section ?? "other";
  const rate = entry?.rate ?? getTdsSection(section).defaultRate;
  return {
    kind: entry?.kind ?? "deducted",
    section,
    amount: rupeesInput(entry?.amount ?? 0),
    source: entry?.source ?? "",
    on: entry?.on ?? new Date().toISOString().slice(0, 10),
    paymentAmount: rupeesInput(entry?.paymentAmount ?? 0),
    ratePercent: rate === null || rate === undefined ? "" : String(percentFromRate(rate)),
    pan: entry?.pan ?? "",
    note: entry?.note ?? "",
    depositStatus:
      entry?.depositStatus ??
      (entry?.kind === "received" ? "pending" : "not_applicable"),
    depositedOn: entry?.depositedOn ?? "",
  };
}

export function TdsEntryForm({
  userId,
  fyId,
  entry,
  defaultKind,
  onSaved,
}: {
  userId: string;
  fyId: string;
  entry?: TdsEntry;
  defaultKind?: TdsKind;
  onSaved: () => void;
}) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(() => {
    const initial = valuesFromEntry(entry);
    if (!entry && defaultKind) {
      initial.kind = defaultKind;
      initial.depositStatus =
        defaultKind === "received" ? "pending" : "not_applicable";
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const rule = getTdsSection(values.section);
  const liveSuggested = useMemo(() => {
    const payment = Number(values.paymentAmount.replace(/[₹,\s]/g, ""));
    const percent = Number(values.ratePercent);
    if (!Number.isFinite(payment) || !Number.isFinite(percent) || payment <= 0 || percent <= 0) {
      return 0;
    }
    return suggestedTds(payment, percent / 100);
  }, [values.paymentAmount, values.ratePercent]);

  function setSection(section: TdsSection) {
    const next = getTdsSection(section);
    setValues((current) => ({
      ...current,
      section,
      ratePercent:
        next.defaultRate === null ? current.ratePercent : String(percentFromRate(next.defaultRate)),
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateTdsInput(values);
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }
    setSubmitting(true);
    if (entry) updateTds(userId, entry.id, validated.data, fyId);
    else addTds(userId, validated.data, fyId);
    setSubmitting(false);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["deducted", "Credit"],
              ["received", "You deducted"],
            ] as const
          ).map(([kind, label]) => (
            <label
              key={kind}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-2 text-sm",
                values.kind === kind
                  ? "border-primary ring-3 ring-ring/30"
                  : "border-border"
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name="kind"
                checked={values.kind === kind}
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    kind,
                    depositStatus:
                      kind === "received"
                        ? current.depositStatus === "not_applicable"
                          ? "pending"
                          : current.depositStatus
                        : "not_applicable",
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Credit is TDS withheld from you (Form 16 / 26AS). You deducted is tax
          you withheld from a payee and must deposit.
        </p>
        {errors.kind ? <p className="text-sm text-destructive">{errors.kind}</p> : null}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-section`}>Section</Label>
        <select
          id={`${formId}-section`}
          className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={values.section}
          onChange={(event) => setSection(event.target.value as TdsSection)}
        >
          {TDS_SECTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{rule.hint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-source`}>Person / entity</Label>
        <Input
          id={`${formId}-source`}
          value={values.source}
          onValueChange={(source) => setValues((current) => ({ ...current, source }))}
          className="h-11 px-3"
          placeholder="Employer, client, or contractor"
        />
        {errors.source ? <p className="text-sm text-destructive">{errors.source}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-pan`}>PAN (optional)</Label>
        <Input
          id={`${formId}-pan`}
          value={values.pan}
          onValueChange={(pan) => setValues((current) => ({ ...current, pan }))}
          className="h-11 px-3 uppercase"
          placeholder="ABCDE1234F"
        />
        {errors.pan ? <p className="text-sm text-destructive">{errors.pan}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-payment`}>Payment / receipt</Label>
          <Input
            id={`${formId}-payment`}
            inputMode="numeric"
            value={values.paymentAmount}
            onValueChange={(paymentAmount) =>
              setValues((current) => ({ ...current, paymentAmount }))
            }
            className="h-11 px-3"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-rate`}>Rate %</Label>
          <Input
            id={`${formId}-rate`}
            inputMode="decimal"
            value={values.ratePercent}
            onValueChange={(ratePercent) =>
              setValues((current) => ({ ...current, ratePercent }))
            }
            className="h-11 px-3"
            placeholder={rule.defaultRate === null ? "—" : String(percentFromRate(rule.defaultRate))}
          />
          {errors.ratePercent ? (
            <p className="text-sm text-destructive">{errors.ratePercent}</p>
          ) : null}
        </div>
      </div>

      {liveSuggested > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Suggested TDS:{" "}
            <span className="font-medium">{formatINR(liveSuggested)}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() =>
              setValues((current) => ({ ...current, amount: String(liveSuggested) }))
            }
          >
            Use suggested
          </Button>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${formId}-amount`}>TDS amount</Label>
        <Input
          id={`${formId}-amount`}
          inputMode="numeric"
          value={values.amount}
          onValueChange={(amount) => setValues((current) => ({ ...current, amount }))}
          className="h-11 px-3"
          placeholder="0"
        />
        {errors.amount ? <p className="text-sm text-destructive">{errors.amount}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-on`}>Date of credit / deduction</Label>
        <Input
          id={`${formId}-on`}
          type="date"
          value={values.on}
          onValueChange={(on) => setValues((current) => ({ ...current, on }))}
          className="h-11 px-3"
        />
        {errors.on ? <p className="text-sm text-destructive">{errors.on}</p> : null}
      </div>

      {values.kind === "received" ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Deposit</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["pending", "Pending"],
                ["deposited", "Deposited"],
              ] as const
            ).map(([status, label]) => (
              <label
                key={status}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2 text-sm",
                  values.depositStatus === status
                    ? "border-primary ring-3 ring-ring/30"
                    : "border-border"
                )}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="depositStatus"
                  checked={values.depositStatus === status}
                  onChange={() =>
                    setValues((current) => ({ ...current, depositStatus: status }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          {values.depositStatus === "deposited" ? (
            <div className="space-y-2">
              <Label htmlFor={`${formId}-deposited`}>Challan date</Label>
              <Input
                id={`${formId}-deposited`}
                type="date"
                value={values.depositedOn}
                onValueChange={(depositedOn) =>
                  setValues((current) => ({ ...current, depositedOn }))
                }
                className="h-11 px-3"
              />
              {errors.depositedOn ? (
                <p className="text-sm text-destructive">{errors.depositedOn}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Deposit by the 7th of the following month (30 April for March).
            </p>
          )}
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${formId}-note`}>Note (optional)</Label>
        <Input
          id={`${formId}-note`}
          value={values.note}
          onValueChange={(note) => setValues((current) => ({ ...current, note }))}
          className="h-11 px-3"
          placeholder="Invoice no., challan, or Form 26AS line"
        />
        {errors.note ? <p className="text-sm text-destructive">{errors.note}</p> : null}
      </div>

      <Button type="submit" className="h-11 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Saving
          </>
        ) : entry ? (
          "Save changes"
        ) : (
          "Add TDS line"
        )}
      </Button>
    </form>
  );
}
