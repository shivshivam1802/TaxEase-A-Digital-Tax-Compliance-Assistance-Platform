"use client";

import { useMemo, useSyncExternalStore } from "react";

import { TAX_CHANGE_EVENT, readYear, type TaxYearRecord } from "@/lib/tax-store";
import { CURRENT_FY_ID } from "@/lib/tax-rules";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TAX_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TAX_CHANGE_EVENT, onChange);
  };
}

export function useTaxYear(userId: string | undefined, fyId = CURRENT_FY_ID): TaxYearRecord {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      if (!userId) return "";
      return JSON.stringify(readYear(userId, fyId));
    },
    () => ""
  );

  return useMemo(() => {
    if (!snapshot) {
      return {
        fyId,
        income: null,
        tds: [],
        itrStatus: "not_started",
        itrUpdatedAt: null,
        updatedAt: "",
      };
    }
    return JSON.parse(snapshot) as TaxYearRecord;
  }, [fyId, snapshot]);
}
