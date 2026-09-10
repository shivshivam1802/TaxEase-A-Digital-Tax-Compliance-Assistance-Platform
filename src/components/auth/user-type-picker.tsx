"use client";

import { USER_TYPES, userTypeDescription, type UserType } from "@/lib/user-type";
import { cn } from "@/lib/utils";

type UserTypePickerProps = {
  name?: string;
  value: "" | UserType;
  onChange: (value: UserType) => void;
  error?: string;
};

export function UserTypePicker({
  name = "userType",
  value,
  onChange,
  error,
}: UserTypePickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">I am filing as</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {USER_TYPES.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3.5 transition-colors",
                selected
                  ? "border-primary ring-3 ring-ring/30"
                  : "border-border hover:border-foreground/20"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {userTypeDescription(option.value)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
