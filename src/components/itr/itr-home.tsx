"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, FileCheck } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/money";
import { FY_2026_27 } from "@/lib/tax-rules";
import {
  ITR_STATUSES,
  saveItrDraft,
  setItrStatus,
  yearOverview,
} from "@/lib/tax-store";
import {
  ITR_FORMS,
  emptyItrDraft,
  grossIncome,
  itrChecklist,
  localAcknowledgement,
  recommendItrForm,
  validateFiling,
  type ItrDraft,
  type ItrFormId,
} from "@/lib/itr";
import { formatIndianDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1 as const, label: "Income" },
  { n: 2 as const, label: "Facts" },
  { n: 3 as const, label: "Form" },
  { n: 4 as const, label: "Bank" },
  { n: 5 as const, label: "Pack" },
];

export function ItrHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const draft = year.itrDraft ?? emptyItrDraft();
  const overview = useMemo(() => yearOverview(year), [year]);
  const recommended = useMemo(
    () =>
      recommendItrForm({
        income: year.income,
        resident: draft.resident,
        hasCapitalGains: draft.hasCapitalGains,
        moreThanOneHouse: draft.moreThanOneHouse,
        hasForeignIncome: draft.hasForeignIncome,
        presumptive: draft.presumptive,
      }),
    [draft, year.income]
  );
  const formId = draft.formId ?? recommended.formId;
  const checklist = useMemo(
    () =>
      itrChecklist({
        formId,
        income: year.income,
        userType: user?.userType ?? "individual",
        hasPan: Boolean(user?.pan),
        documents: year.documents ?? [],
      }),
    [formId, user?.pan, user?.userType, year.documents, year.income]
  );

  if (!user) return null;

  const userId = user.id;
  const statusLabel =
    ITR_STATUSES.find((item) => item.value === year.itrStatus)?.label ?? "Not started";

  function persist(next: ItrDraft) {
    saveItrDraft(userId, next, year.fyId);
    setErrors({});
  }

  function go(step: ItrDraft["step"]) {
    if (step >= 2 && grossIncome(year.income) === 0) {
      setErrors({ form: "Record income on the dashboard or calculator first." });
      return;
    }
    if (year.itrStatus === "not_started" && step >= 2) {
      setItrStatus(userId, "in_progress", year.fyId);
    }
    persist({ ...draft, step, formId: draft.formId ?? recommended.formId });
  }

  function filePack() {
    const result = validateFiling({
      income: year.income,
      formId,
      bankAccount: draft.bankAccount,
      ifsc: draft.ifsc,
      missingRequired: checklist.missingRequired,
      acceptGaps: draft.acceptGaps,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const acknowledgement = localAcknowledgement();
    const filedOn = new Date().toISOString();
    persist({
      ...draft,
      formId,
      step: 5,
      acknowledgement,
      filedOn,
    });
    setItrStatus(userId, "filed", year.fyId);
  }

  function verifyPack() {
    if (!draft.acknowledgement) {
      setErrors({ form: "Prepare the pack before e-verifying." });
      return;
    }
    persist({
      ...draft,
      verifiedOn: new Date().toISOString(),
      step: 5,
    });
    setItrStatus(userId, "verified", year.fyId);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            ITR assistant
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {FY_2026_27.assessmentYear} return
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Build a filing pack from the income and TDS already on TaxEase. This
            stays in your browser — it is not a submission to the Income Tax
            Department.
          </p>
        </div>
        <Badge variant="secondary" className="h-7 px-3">
          {statusLabel}
        </Badge>
      </div>

      <ol className="mt-8 grid grid-cols-5 gap-1">
        {STEPS.map((item) => {
          const current = draft.step === item.n;
          const done = draft.step > item.n;
          return (
            <li key={item.n}>
              <button
                type="button"
                onClick={() => go(item.n)}
                className={cn(
                  "flex w-full flex-col items-start rounded-xl border px-2 py-2 text-left sm:px-3",
                  current
                    ? "border-primary bg-primary/5 ring-3 ring-ring/30"
                    : "border-border bg-card"
                )}
              >
                <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  {done ? "Done" : `0${item.n}`}
                </span>
                <span className="text-xs font-medium sm:text-sm">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {errors.form ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        {draft.step === 1 ? (
          <IncomeStep
            gross={grossIncome(year.income)}
            salary={year.income?.salary ?? 0}
            business={year.income?.business ?? 0}
            other={year.income?.other ?? 0}
            tax={overview.computation?.totalTax ?? null}
            tds={overview.tdsDeducted}
            remaining={overview.remaining}
          />
        ) : null}

        {draft.step === 2 ? (
          <FactsStep
            draft={draft}
            onChange={(patch) => persist({ ...draft, ...patch })}
          />
        ) : null}

        {draft.step === 3 ? (
          <FormStep
            formId={formId}
            recommended={recommended}
            checklist={checklist.items}
            onForm={(next) => persist({ ...draft, formId: next })}
          />
        ) : null}

        {draft.step === 4 ? (
          <BankStep
            draft={draft}
            errors={errors}
            formId={formId}
            tax={overview.computation?.totalTax ?? null}
            remaining={overview.remaining}
            onChange={(patch) => persist({ ...draft, ...patch })}
          />
        ) : null}

        {draft.step === 5 ? (
          <PackStep
            draft={{ ...draft, formId }}
            statusLabel={statusLabel}
            missingRequired={checklist.missingRequired}
            errors={errors}
            onAcceptGaps={(acceptGaps) => persist({ ...draft, acceptGaps })}
            onFile={filePack}
            onVerify={verifyPack}
          />
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4"
            disabled={draft.step === 1}
            onClick={() => go((draft.step - 1) as ItrDraft["step"])}
          >
            <ChevronLeft /> Back
          </Button>
          {draft.step < 5 ? (
            <Button type="button" className="h-11 px-4" onClick={() => go((draft.step + 1) as ItrDraft["step"])}>
              Continue <ChevronRight />
            </Button>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

function IncomeStep({
  gross,
  salary,
  business,
  other,
  tax,
  tds,
  remaining,
}: {
  gross: number;
  salary: number;
  business: number;
  other: number;
  tax: number | null;
  tds: number;
  remaining: number | null;
}) {
  return (
    <div>
      <h2 className="font-heading text-xl font-medium">Income already on file</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The assistant reads the FY 2026–27 snapshot from your dashboard. Edit
        it there if a head of income is wrong.
      </p>
      {gross === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          No income recorded yet.{" "}
          <Link href="/dashboard" className="font-medium text-primary underline-offset-3 hover:underline">
            Record income
          </Link>{" "}
          or{" "}
          <Link href="/calculator" className="font-medium text-primary underline-offset-3 hover:underline">
            open the calculator
          </Link>
          .
        </p>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label="Salary" value={formatINR(salary)} />
          <Row label="Business / profession" value={formatINR(business)} />
          <Row label="Other income" value={formatINR(other)} />
          <Row label="Gross" value={formatINR(gross)} />
          <Row label="Estimated tax" value={tax === null ? "—" : formatINR(tax)} />
          <Row label="TDS credit" value={formatINR(tds)} />
          <Row
            label="Still payable"
            value={remaining === null ? "—" : formatINR(remaining)}
          />
        </dl>
      )}
    </div>
  );
}

function FactsStep({
  draft,
  onChange,
}: {
  draft: ItrDraft;
  onChange: (patch: Partial<ItrDraft>) => void;
}) {
  const toggles: { key: keyof Pick<ItrDraft, "resident" | "hasCapitalGains" | "moreThanOneHouse" | "hasForeignIncome" | "presumptive">; label: string; hint: string }[] = [
    { key: "resident", label: "Resident in India for FY 2026–27", hint: "ITR-1 is only for residents." },
    { key: "hasCapitalGains", label: "Capital gains this year", hint: "Equity, property, or other capital assets." },
    { key: "moreThanOneHouse", label: "More than one house property", hint: "Sahaj allows only one." },
    { key: "hasForeignIncome", label: "Foreign income or assets", hint: "Pushes the return off ITR-1." },
    { key: "presumptive", label: "Presumptive business (44AD / 44ADA / 44AE)", hint: "Opens ITR-4 Sugam when income fits." },
  ];

  return (
    <div>
      <h2 className="font-heading text-xl font-medium">Facts that choose the form</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Answer for this year only. The recommendation updates as you toggle.
      </p>
      <ul className="mt-4 space-y-2">
        {toggles.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={draft[item.key]}
                onChange={(event) => onChange({ [item.key]: event.target.checked })}
              />
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormStep({
  formId,
  recommended,
  checklist,
  onForm,
}: {
  formId: ItrFormId;
  recommended: ReturnType<typeof recommendItrForm>;
  checklist: ReturnType<typeof itrChecklist>["items"];
  onForm: (formId: ItrFormId) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-heading text-xl font-medium">Recommended form</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {recommended.reasons.join(" ")} You can override if a CA has told you
          otherwise.
        </p>
        <div className="mt-4 grid gap-2">
          {ITR_FORMS.map((form) => (
            <label
              key={form.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border px-3 py-3",
                formId === form.id
                  ? "border-primary ring-3 ring-ring/30"
                  : "border-border"
              )}
            >
              <input
                type="radio"
                name="itrForm"
                className="mt-1 size-4 accent-primary"
                checked={formId === form.id}
                onChange={() => onForm(form.id)}
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {form.id}
                  {form.id === recommended.formId ? (
                    <Badge variant="secondary">Recommended</Badge>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {form.summary}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-heading text-xl font-medium">Document gaps</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tick-off is based on what is already in the vault and on your PAN.
        </p>
        <ul className="mt-4 space-y-2">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
              <Badge variant={item.met ? "default" : item.required ? "destructive" : "outline"}>
                {item.met ? "On file" : item.required ? "Missing" : "Optional"}
              </Badge>
            </li>
          ))}
        </ul>
        <Link
          href="/documents"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-10")}
        >
          Open document vault
        </Link>
      </div>
    </div>
  );
}

function BankStep({
  draft,
  errors,
  formId,
  tax,
  remaining,
  onChange,
}: {
  draft: ItrDraft;
  errors: Record<string, string>;
  formId: ItrFormId;
  tax: number | null;
  remaining: number | null;
  onChange: (patch: Partial<ItrDraft>) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-heading text-xl font-medium">Refund bank account</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use an account in your name. IFSC must be 11 characters.
        </p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="account">Account number</Label>
            <Input
              id="account"
              className="h-10"
              inputMode="numeric"
              autoComplete="off"
              value={draft.bankAccount}
              aria-invalid={Boolean(errors.bankAccount)}
              onValueChange={(bankAccount) => onChange({ bankAccount })}
            />
            {errors.bankAccount ? (
              <p className="text-xs text-destructive">{errors.bankAccount}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input
              id="ifsc"
              className="h-10 uppercase"
              value={draft.ifsc}
              aria-invalid={Boolean(errors.ifsc)}
              onValueChange={(ifsc) => onChange({ ifsc: ifsc.toUpperCase() })}
            />
            {errors.ifsc ? (
              <p className="text-xs text-destructive">{errors.ifsc}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div>
        <h2 className="font-heading text-xl font-medium">Review</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Form" value={formId} />
          <Row label="Estimated tax" value={tax === null ? "—" : formatINR(tax)} />
          <Row label="Still payable" value={remaining === null ? "—" : formatINR(remaining)} />
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Non-audit due date is {formatIndianDate("2027-07-31")}. Prepare the
          pack here, then file on the government portal with these figures.
        </p>
      </div>
    </div>
  );
}

function PackStep({
  draft,
  statusLabel,
  missingRequired,
  errors,
  onAcceptGaps,
  onFile,
  onVerify,
}: {
  draft: ItrDraft;
  statusLabel: string;
  missingRequired: number;
  errors: Record<string, string>;
  onAcceptGaps: (value: boolean) => void;
  onFile: () => void;
  onVerify: () => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <FileCheck className="mt-0.5 size-5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="font-heading text-xl font-medium">Filing pack</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Saving the pack records an acknowledgement on this device and marks
            the year as filed. e-Verify is the same local marker — use the
            Income Tax portal when you actually submit.
          </p>
        </div>
      </div>

      {draft.acknowledgement ? (
        <div className="mt-4 rounded-xl bg-primary/5 px-4 py-3">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Local acknowledgement
          </p>
          <p className="mt-1 font-mono text-sm font-medium">{draft.acknowledgement}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Status: {statusLabel}
            {draft.filedOn ? ` · packed ${formatIndianDate(draft.filedOn)}` : ""}
            {draft.verifiedOn ? ` · verified ${formatIndianDate(draft.verifiedOn)}` : ""}
          </p>
        </div>
      ) : null}

      {missingRequired > 0 && !draft.acknowledgement ? (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={draft.acceptGaps}
            onChange={(event) => onAcceptGaps(event.target.checked)}
          />
          <span className="text-sm leading-6">
            {missingRequired} required paper{missingRequired === 1 ? " is" : "s are"} still
            missing. I will attach them before I submit on the Income Tax portal.
          </span>
        </label>
      ) : null}
      {errors.acceptGaps ? (
        <p className="mt-2 text-xs text-destructive">{errors.acceptGaps}</p>
      ) : null}
      {errors.formId ? (
        <p className="mt-2 text-xs text-destructive">{errors.formId}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="h-11 px-4"
          disabled={Boolean(draft.acknowledgement)}
          onClick={onFile}
        >
          Save filing pack
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4"
          disabled={!draft.acknowledgement || Boolean(draft.verifiedOn)}
          onClick={onVerify}
        >
          <Check /> Mark e-verified
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
