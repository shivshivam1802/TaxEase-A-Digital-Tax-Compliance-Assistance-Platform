"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  TAX_CHANGE_EVENT,
  TAX_STORE_KEY,
  emptyYear,
  readYear,
  type TaxYearRecord,
} from "@/lib/tax-store";
import { CURRENT_FY_ID } from "@/lib/tax-rules";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(TAX_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(TAX_CHANGE_EVENT, onChange);
  };
}

let cachedUserId: string | undefined;
let cachedFyId = "";
let cachedRaw: string | null | undefined;
let cachedSnapshot = "";

function getYearSnapshot(userId: string | undefined, fyId: string) {
  if (!userId) return "";
  const raw = window.localStorage.getItem(TAX_STORE_KEY);
  if (
    userId === cachedUserId &&
    fyId === cachedFyId &&
    raw === cachedRaw &&
    cachedSnapshot !== ""
  ) {
    return cachedSnapshot;
  }
  cachedUserId = userId;
  cachedFyId = fyId;
  cachedRaw = raw;
  cachedSnapshot = JSON.stringify(readYear(userId, fyId));
  return cachedSnapshot;
}

export function useTaxYear(userId: string | undefined, fyId = CURRENT_FY_ID): TaxYearRecord {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getYearSnapshot(userId, fyId),
    () => ""
  );

  return useMemo(() => {
    if (!snapshot) return emptyYear(fyId);
    return JSON.parse(snapshot) as TaxYearRecord;
  }, [fyId, snapshot]);
}
