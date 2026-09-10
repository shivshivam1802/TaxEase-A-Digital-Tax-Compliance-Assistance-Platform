"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeTax } from "@/lib/tax-engine";
import { formatINR, rupeesInput } from "@/lib/money";
import { saveIncome, validateIncomeInput, type TaxYearRecord } from "@/lib/tax-store";
import { userTypeLabel, type UserType } from "@/lib/user-type";

export function EstimateForm({
  userId,
  userType,
  year,
  onSaved,
}: {
  userId: string;
  userType: UserType;
  year: TaxYearRecord;
  onSaved: () => void;
}) {
  const formId = useId();
  const income = year.income;
  const [values, setValues] = useState({
    salary: rupeesInput(income?.salary ?? 0),
    business: rupeesInput(income?.business ?? 0),
    other: rupeesInput(income?.other ?? 0),
    deductions: rupeesInput(income?.deductions ?? 0),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const preview = validateIncomeInput(values);
  const live = preview.ok ? computeTax(preview.data, year.fyId) : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateIncomeInput(values);
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }
    setSubmitting(true);
    saveIncome(userId, validated.data, year.fyId);
    setSubmitting(false);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Snapshot for a {userTypeLabel(userType).toLowerCase()} under the new regime.
        Salary gets the ₹75,000 standard deduction automatically.
      </p>
      <AmountField
        id={`${formId}-salary`}
        label="Salary / pension"
        value={values.salary}
        error={errors.salary}
        onChange={(salary) => setValues((current) => ({ ...current, salary }))}
      />
      <AmountField
        id={`${formId}-business`}
        label="Business / professional"
        value={values.business}
        error={errors.business}
        onChange={(business) => setValues((current) => ({ ...current, business }))}
      />
      <AmountField
        id={`${formId}-other`}
        label="Other income"
        value={values.other}
        error={errors.other}
        onChange={(other) => setValues((current) => ({ ...current, other }))}
      />
      <AmountField
        id={`${formId}-deductions`}
        label="Other deductions (optional)"
        value={values.deductions}
        error={errors.deductions}
        onChange={(deductions) => setValues((current) => ({ ...current, deductions }))}
      />
      {live ? (
        <p className="rounded-lg bg-secondary/80 px-3 py-2 text-sm">
          Estimated tax:{" "}
          <span className="font-medium text-foreground">{formatINR(live.totalTax)}</span>
          <span className="text-muted-foreground">
            {" "}
            · taxable {formatINR(live.taxableIncome)}
          </span>
        </p>
      ) : null}
      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" className="h-11 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Saving
          </>
        ) : (
          "Save estimate"
        )}
      </Button>
    </form>
  );
}

function AmountField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        onValueChange={onChange}
        placeholder="0"
        aria-invalid={Boolean(error)}
        className="h-11 px-3"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
