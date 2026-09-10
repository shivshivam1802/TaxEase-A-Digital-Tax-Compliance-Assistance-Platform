"use client";

import { useId, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTds, validateTdsInput } from "@/lib/tax-store";
import { cn } from "@/lib/utils";

export function TdsForm({
  userId,
  fyId,
  onSaved,
}: {
  userId: string;
  fyId: string;
  onSaved: () => void;
}) {
  const formId = useId();
  const [values, setValues] = useState({
    kind: "deducted" as "deducted" | "received",
    amount: "",
    source: "",
    on: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateTdsInput(values);
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }
    setSubmitting(true);
    addTds(userId, validated.data, fyId);
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
              ["deducted", "TDS deducted"],
              ["received", "TDS received"],
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
                onChange={() => setValues((current) => ({ ...current, kind }))}
              />
              {label}
            </label>
          ))}
        </div>
        {errors.kind ? <p className="text-sm text-destructive">{errors.kind}</p> : null}
      </fieldset>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-amount`}>Amount</Label>
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
        <Label htmlFor={`${formId}-source`}>Source</Label>
        <Input
          id={`${formId}-source`}
          value={values.source}
          onValueChange={(source) => setValues((current) => ({ ...current, source }))}
          className="h-11 px-3"
          placeholder="Employer, client, or Form 26AS line"
        />
        {errors.source ? <p className="text-sm text-destructive">{errors.source}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${formId}-on`}>Date</Label>
        <Input
          id={`${formId}-on`}
          type="date"
          value={values.on}
          onValueChange={(on) => setValues((current) => ({ ...current, on }))}
          className="h-11 px-3"
        />
        {errors.on ? <p className="text-sm text-destructive">{errors.on}</p> : null}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" />
            Saving
          </>
        ) : (
          "Add TDS"
        )}
      </Button>
    </form>
  );
}
