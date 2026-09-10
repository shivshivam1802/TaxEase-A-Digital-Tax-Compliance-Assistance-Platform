"use client";

import { useId, useState, type FormEvent } from "react";
import { CircleCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveWaitlistEntry,
  USER_TYPES,
  validateWaitlistInput,
  type UserType,
  type WaitlistEntry,
  type WaitlistErrors,
} from "@/lib/waitlist";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  email: "",
  userType: "" as "" | UserType,
};

export function WaitlistForm() {
  const formId = useId();
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState<WaitlistErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const [saved, setSaved] = useState<WaitlistEntry | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const validated = validateWaitlistInput({
      name: values.name,
      email: values.email,
      userType: values.userType,
    });

    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }

    setStatus("submitting");
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    const result = saveWaitlistEntry(validated.data);
    if (!result.ok) {
      setStatus("idle");
      setErrors(result.errors);
      return;
    }

    setSaved(result.entry);
    setStatus("success");
    setValues(emptyForm);
  }

  if (status === "success" && saved) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
      >
        <CircleCheck className="size-8 text-primary" aria-hidden="true" />
        <h3 className="mt-3 font-heading text-2xl font-medium text-foreground">
          You are on the list.
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Thanks, {saved.name}. We saved your request as{" "}
          <span className="font-medium text-foreground">
            {saved.userType === "individual"
              ? "an individual"
              : "a small business"}
          </span>{" "}
          at {saved.email}. When access opens, that is the inbox we will use.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 h-10 px-4"
          onClick={() => {
            setStatus("idle");
            setSaved(null);
            setErrors({});
          }}
        >
          Submit another email
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={errors.form ? `${formId}-form-error` : undefined}
    >
      <div className="space-y-2">
        <Label htmlFor={`${formId}-name`}>Full name</Label>
        <Input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          onValueChange={(value) =>
            setValues((current) => ({ ...current, name: value }))
          }
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          placeholder="e.g. Priya Sharma"
          className="h-11 px-3"
        />
        {errors.name ? (
          <p id={`${formId}-name-error`} className="text-sm text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-email`}>Email</Label>
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onValueChange={(value) =>
            setValues((current) => ({ ...current, email: value }))
          }
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          placeholder="you@studio.in"
          className="h-11 px-3"
        />
        {errors.email ? (
          <p id={`${formId}-email-error`} className="text-sm text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">I am filing as</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {USER_TYPES.map((option) => {
            const selected = values.userType === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3.5 transition-colors",
                  selected
                    ? "border-primary ring-3 ring-ring/30"
                    : "border-border hover:border-foreground/20",
                  errors.userType ? "aria-invalid:border-destructive" : ""
                )}
              >
                <input
                  type="radio"
                  name="userType"
                  value={option.value}
                  checked={selected}
                  onChange={() =>
                    setValues((current) => ({
                      ...current,
                      userType: option.value,
                    }))
                  }
                  className="mt-1 size-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {option.value === "individual"
                      ? "Salary, freelance, or capital income"
                      : "Proprietor, firm, or small company"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.userType ? (
          <p id={`${formId}-type-error`} className="text-sm text-destructive">
            {errors.userType}
          </p>
        ) : null}
      </fieldset>

      {errors.form ? (
        <p
          id={`${formId}-form-error`}
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full px-4 sm:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <LoaderCircle className="animate-spin" />
            Saving request
          </>
        ) : (
          "Request early access"
        )}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        Stored locally in this browser for now. No account is created until
        authentication ships.
      </p>
    </form>
  );
}
