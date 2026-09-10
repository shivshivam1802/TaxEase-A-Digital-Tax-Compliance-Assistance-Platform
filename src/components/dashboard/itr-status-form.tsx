"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ITR_STATUSES, setItrStatus, type ItrStatus } from "@/lib/tax-store";
import { cn } from "@/lib/utils";

export function ItrStatusForm({
  userId,
  fyId,
  current,
  onSaved,
}: {
  userId: string;
  fyId: string;
  current: ItrStatus;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<ItrStatus>(current);

  function save() {
    setItrStatus(userId, status, fyId);
    onSaved();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Track where the return stands. Open the ITR assistant to build a filing pack
        from income and TDS already on file.
      </p>
      <div className="grid gap-2">
        {ITR_STATUSES.map((option) => (
          <label
            key={option.value}
            className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
                status === option.value
                  ? "border-primary ring-3 ring-ring/30"
                  : "border-border"
              )}
          >
            <input
              type="radio"
              name="itrStatus"
              className="size-4 accent-primary"
              checked={status === option.value}
              onChange={() => setStatus(option.value)}
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
      <Button type="button" className="h-11 w-full" onClick={save}>
        Update ITR status
      </Button>
    </div>
  );
}
