"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Calculator, LoaderCircle } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { AmountField } from "@/components/calculator/amount-field";
import { RegimePanel, regimeLabel } from "@/components/calculator/regime-panel";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { hraExemption } from "@/lib/hra";
import { formatINR, parseRupees, rupeesInput } from "@/lib/money";
import {
  calculatorFromIncome,
  compareRegimes,
  emptyCalculatorInput,
  type CalculatorInput,
} from "@/lib/tax-engine";
import {
  AGE_BANDS,
  FY_2026_27,
  section80DLimit,
  type AgeBand,
  type RegimeId,
} from "@/lib/tax-rules";
import {
  parseCalculatorDraft,
  saveCalculator,
  validateCalculatorInput,
} from "@/lib/tax-store";
import { cn } from "@/lib/utils";

type View = "compare" | RegimeId;

type FormValues = {
  salary: string;
  business: string;
  other: string;
  newOtherDeductions: string;
  section80C: string;
  section80D: string;
  hraExemption: string;
  housingLoanInterest: string;
  ageBand: AgeBand;
};

function valuesFromInput(input: CalculatorInput): FormValues {
  return {
    salary: rupeesInput(input.salary),
    business: rupeesInput(input.business),
    other: rupeesInput(input.other),
    newOtherDeductions: rupeesInput(input.newOtherDeductions),
    section80C: rupeesInput(input.section80C),
    section80D: rupeesInput(input.section80D),
    hraExemption: rupeesInput(input.hraExemption),
    housingLoanInterest: rupeesInput(input.housingLoanInterest),
    ageBand: input.ageBand,
  };
}

export function CalculatorHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const formId = useId();
  const storedInput =
    year.calculator ??
    (year.income ? calculatorFromIncome(year.income) : emptyCalculatorInput());

  const [edited, setEdited] = useState<FormValues | null>(null);
  const values = edited ?? valuesFromInput(storedInput);
  const [view, setView] = useState<View>("compare");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hraOpen, setHraOpen] = useState(false);
  const [hra, setHra] = useState({
    basic: "",
    hraReceived: "",
    rentPaid: "",
    metro: true,
  });

  function patch(next: Partial<FormValues>) {
    setSaved(false);
    setEdited((current) => ({
      ...(current ?? valuesFromInput(storedInput)),
      ...next,
    }));
  }

  const draft = parseCalculatorDraft(values);
  const comparison = useMemo(() => {
    if (!draft.ok) return null;
    if (draft.data.salary + draft.data.business + draft.data.other === 0) return null;
    return compareRegimes(draft.data, year.fyId);
  }, [draft, year.fyId]);

  const eightyDCap = section80DLimit(values.ageBand);

  if (!user) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const validated = validateCalculatorInput(values);
    if (!validated.ok) {
      setErrors(validated.errors);
      setSaved(false);
      return;
    }
    setSubmitting(true);
    saveCalculator(user.id, validated.data, year.fyId);
    setSubmitting(false);
    setErrors({});
    setEdited(null);
    setSaved(true);
  }

  function applyHra() {
    const amount = hraExemption({
      basic: parseRupees(hra.basic) ?? 0,
      hraReceived: parseRupees(hra.hraReceived) ?? 0,
      rentPaid: parseRupees(hra.rentPaid) ?? 0,
      metro: hra.metro,
    });
    patch({ hraExemption: amount ? String(amount) : "" });
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Calculator
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {FY_2026_27.label} tax
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compare the new regime (default under s.115BAC) with the old regime,
            including surcharge and 4% cess. Figures are for individuals / HUFs
            — partnership firms and companies are not covered.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{FY_2026_27.assessmentYear}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 className="font-heading text-lg font-medium">Income</h2>
          <div className="mt-4 space-y-4">
            <AmountField
              id={`${formId}-salary`}
              label="Salary / pension"
              value={values.salary}
              error={errors.salary}
              onChange={(salary) => patch({ salary })}
            />
            <AmountField
              id={`${formId}-business`}
              label="Business / professional"
              value={values.business}
              error={errors.business}
              onChange={(business) => patch({ business })}
            />
            <AmountField
              id={`${formId}-other`}
              label="Other income"
              hint="Interest, rent (after 30% if you have already netted it), and similar heads."
              value={values.other}
              error={errors.other}
              onChange={(other) => patch({ other })}
            />
          </div>

          <fieldset className="mt-6 space-y-2">
            <legend className="text-sm font-medium">Age</legend>
            <div className="grid gap-2">
              {AGE_BANDS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5",
                    values.ageBand === option.value
                      ? "border-primary ring-3 ring-ring/30"
                      : "border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="ageBand"
                    className="mt-1 size-4 accent-primary"
                    checked={values.ageBand === option.value}
                    onChange={() => patch({ ageBand: option.value })}
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.ageBand ? (
              <p className="text-sm text-destructive">{errors.ageBand}</p>
            ) : null}
          </fieldset>

          <Separator className="my-6" />

          <h2 className="font-heading text-lg font-medium">New regime</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Standard deduction of ₹75,000 applies automatically on salary. Most
            Chapter VI-A deductions (80C, HRA, 80D) are not available.
          </p>
          <div className="mt-4">
            <AmountField
              id={`${formId}-new-other`}
              label="Other allowed deductions"
              hint="Employer NPS (80CCD(2)) and similar amounts that still apply."
              value={values.newOtherDeductions}
              error={errors.newOtherDeductions}
              onChange={(newOtherDeductions) => patch({ newOtherDeductions })}
            />
          </div>

          <Separator className="my-6" />

          <h2 className="font-heading text-lg font-medium">Old regime</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Standard deduction of ₹50,000 on salary. Amounts above the statutory
            cap are ignored.
          </p>
          <div className="mt-4 space-y-4">
            <AmountField
              id={`${formId}-80c`}
              label="s.80C"
              hint="EPF, ELSS, life insurance, principal — capped at ₹1,50,000."
              value={values.section80C}
              error={errors.section80C}
              onChange={(section80C) => patch({ section80C })}
            />
            <AmountField
              id={`${formId}-80d`}
              label="s.80D (health insurance)"
              hint={`Self / family premium. Cap for this age band: ${formatINR(eightyDCap)}.`}
              value={values.section80D}
              error={errors.section80D}
              onChange={(section80D) => patch({ section80D })}
            />
            <AmountField
              id={`${formId}-housing`}
              label="Housing loan interest (s.24b)"
              hint="Self-occupied cap ₹2,00,000."
              value={values.housingLoanInterest}
              error={errors.housingLoanInterest}
              onChange={(housingLoanInterest) => patch({ housingLoanInterest })}
            />
            <AmountField
              id={`${formId}-hra`}
              label="HRA exemption"
              hint="From Form 16, or use the working below."
              value={values.hraExemption}
              error={errors.hraExemption}
              onChange={(hraExemption) => patch({ hraExemption })}
            />
          </div>

          <div className="mt-4 rounded-xl border border-border/80 p-3">
            <button
              type="button"
              className="text-sm font-medium text-foreground underline-offset-3 hover:underline"
              onClick={() => setHraOpen((open) => !open)}
              aria-expanded={hraOpen}
            >
              {hraOpen ? "Hide HRA working" : "Work out HRA exemption"}
            </button>
            {hraOpen ? (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-hra-basic`}>Basic salary</Label>
                  <Input
                    id={`${formId}-hra-basic`}
                    inputMode="numeric"
                    value={hra.basic}
                    onValueChange={(basic) => setHra((current) => ({ ...current, basic }))}
                    className="h-11 px-3"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-hra-received`}>HRA received</Label>
                  <Input
                    id={`${formId}-hra-received`}
                    inputMode="numeric"
                    value={hra.hraReceived}
                    onValueChange={(hraReceived) =>
                      setHra((current) => ({ ...current, hraReceived }))
                    }
                    className="h-11 px-3"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-hra-rent`}>Rent paid</Label>
                  <Input
                    id={`${formId}-hra-rent`}
                    inputMode="numeric"
                    value={hra.rentPaid}
                    onValueChange={(rentPaid) =>
                      setHra((current) => ({ ...current, rentPaid }))
                    }
                    className="h-11 px-3"
                    placeholder="0"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={hra.metro}
                    onChange={(event) =>
                      setHra((current) => ({ ...current, metro: event.target.checked }))
                    }
                  />
                  Metro city (50% of basic; otherwise 40%)
                </label>
                <Button type="button" variant="outline" className="h-10 w-full" onClick={applyHra}>
                  Apply exemption
                </Button>
              </div>
            ) : null}
          </div>

          {errors.form ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {errors.form}
            </p>
          ) : null}
          {saved ? (
            <p className="mt-4 rounded-lg bg-secondary/80 px-3 py-2 text-sm">
              Saved to your {FY_2026_27.label} dashboard (new-regime estimate).{" "}
              <Link href="/dashboard" className="font-medium underline underline-offset-3">
                Open dashboard
              </Link>
            </p>
          ) : null}

          <Button type="submit" className="mt-5 h-11 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="animate-spin" />
                Saving
              </>
            ) : (
              "Save to dashboard"
            )}
          </Button>
        </form>

        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["compare", "Compare"],
                ["new", "New regime"],
                ["old", "Old regime"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                type="button"
                variant={view === id ? "default" : "outline"}
                className="h-10 px-4"
                onClick={() => setView(id)}
              >
                {label}
              </Button>
            ))}
          </div>

          {!draft.ok ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <Calculator className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-heading text-lg font-medium">Fix the amounts</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter whole rupee amounts without letters. Commas and ₹ are fine.
              </p>
            </div>
          ) : !comparison ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <Calculator className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-heading text-lg font-medium">Waiting on income</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Add salary, business, or other income to see new vs old regime tax,
                rebate, surcharge, and cess.
              </p>
            </div>
          ) : (
            <>
              {view === "compare" ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
                    Recommendation
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-medium tracking-tight">
                    {comparison.recommended === "tie"
                      ? "Both regimes produce the same tax."
                      : `${regimeLabel(comparison.recommended)} is cheaper by ${formatINR(comparison.savings)}.`}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The dashboard estimate always uses the new regime (the statutory
                    default). Saving from here updates that snapshot.
                  </p>
                </div>
              ) : null}

              <div
                className={cn(
                  "grid gap-4",
                  view === "compare" && "lg:grid-cols-2"
                )}
              >
                {view !== "old" ? (
                  <RegimePanel
                    title="New regime"
                    computation={comparison.new}
                    highlighted={comparison.recommended === "new"}
                    badge={comparison.recommended === "new" ? "Lower tax" : undefined}
                  />
                ) : null}
                {view !== "new" ? (
                  <RegimePanel
                    title="Old regime"
                    computation={comparison.old}
                    highlighted={comparison.recommended === "old"}
                    badge={comparison.recommended === "old" ? "Lower tax" : undefined}
                  />
                ) : null}
              </div>
            </>
          )}

          <p className="text-xs leading-5 text-muted-foreground">
            Not tax advice. Special rates (equity LTCG, STCG, winnings) and
            surcharge on those heads are omitted. A CA should review contested
            years.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
