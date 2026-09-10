import { parseRupees } from "@/lib/money";
import { CURRENT_FY_ID, type AgeBand } from "@/lib/tax-rules";
import {
  computeTax,
  emptyCalculatorInput,
  emptyIncome,
  incomeFromCalculator,
  type CalculatorInput,
  type IncomeSnapshot,
  type TaxComputation,
} from "@/lib/tax-engine";

export const TAX_STORE_KEY = "niyam.tax.v1";
export const TAX_CHANGE_EVENT = "niyam-tax-change";

export const ITR_STATUSES = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "filed", label: "Filed" },
  { value: "verified", label: "e-Verified" },
] as const;

export type ItrStatus = (typeof ITR_STATUSES)[number]["value"];

export type TdsKind = "deducted" | "received";

export type TdsEntry = {
  id: string;
  kind: TdsKind;
  amount: number;
  source: string;
  on: string;
};

export type TaxYearRecord = {
  fyId: string;
  income: IncomeSnapshot | null;
  tds: TdsEntry[];
  itrStatus: ItrStatus;
  itrUpdatedAt: string | null;
  calculator: CalculatorInput | null;
  updatedAt: string;
};

export type TaxStore = {
  byUser: Record<string, Record<string, TaxYearRecord>>;
};

export function emptyYear(fyId = CURRENT_FY_ID): TaxYearRecord {
  return {
    fyId,
    income: null,
    tds: [],
    itrStatus: "not_started",
    itrUpdatedAt: null,
    calculator: null,
    updatedAt: "",
  };
}

export function readYear(userId: string, fyId = CURRENT_FY_ID): TaxYearRecord {
  const store = readStore();
  return store.byUser[userId]?.[fyId] ?? emptyYear(fyId);
}

export function saveIncome(
  userId: string,
  income: IncomeSnapshot,
  fyId = CURRENT_FY_ID
): TaxYearRecord {
  return patchYear(userId, fyId, (year) => ({
    ...year,
    income,
    calculator: year.calculator
      ? {
          ...year.calculator,
          salary: income.salary,
          business: income.business,
          other: income.other,
          newOtherDeductions: income.deductions,
        }
      : year.calculator,
  }));
}

export function saveCalculator(
  userId: string,
  input: CalculatorInput,
  fyId = CURRENT_FY_ID
): TaxYearRecord {
  return patchYear(userId, fyId, (year) => ({
    ...year,
    income: incomeFromCalculator(input),
    calculator: input,
  }));
}

export function addTds(
  userId: string,
  input: Omit<TdsEntry, "id">,
  fyId = CURRENT_FY_ID
): TaxYearRecord {
  const entry: TdsEntry = { ...input, id: crypto.randomUUID() };
  return patchYear(userId, fyId, (year) => ({
    ...year,
    tds: [entry, ...year.tds],
  }));
}

export function removeTds(
  userId: string,
  tdsId: string,
  fyId = CURRENT_FY_ID
): TaxYearRecord {
  return patchYear(userId, fyId, (year) => ({
    ...year,
    tds: year.tds.filter((entry) => entry.id !== tdsId),
  }));
}

export function setItrStatus(
  userId: string,
  itrStatus: ItrStatus,
  fyId = CURRENT_FY_ID
): TaxYearRecord {
  return patchYear(userId, fyId, (year) => ({
    ...year,
    itrStatus,
    itrUpdatedAt: new Date().toISOString(),
  }));
}

export function yearOverview(year: TaxYearRecord): {
  computation: TaxComputation | null;
  tdsDeducted: number;
  tdsReceived: number;
  remaining: number | null;
} {
  const computation = year.income ? computeTax(year.income, year.fyId) : null;
  const tdsDeducted = year.tds
    .filter((entry) => entry.kind === "deducted")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const tdsReceived = year.tds
    .filter((entry) => entry.kind === "received")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const remaining = computation ? Math.max(0, computation.totalTax - tdsDeducted) : null;

  return { computation, tdsDeducted, tdsReceived, remaining };
}

export function validateIncomeInput(input: {
  salary: string;
  business: string;
  other: string;
  deductions: string;
}):
  | { ok: true; data: IncomeSnapshot }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const salary = parseField(input.salary, "salary", errors);
  const business = parseField(input.business, "business", errors);
  const other = parseField(input.other, "other", errors);
  const deductions = parseField(input.deductions, "deductions", errors);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const data = {
    salary: salary ?? 0,
    business: business ?? 0,
    other: other ?? 0,
    deductions: deductions ?? 0,
  };

  if (data.salary + data.business + data.other === 0) {
    return {
      ok: false,
      errors: { form: "Enter at least one income amount." },
    };
  }

  return { ok: true, data };
}

const AGE_BANDS: AgeBand[] = ["below_60", "senior", "super_senior"];

function isAgeBand(value: string): value is AgeBand {
  return AGE_BANDS.includes(value as AgeBand);
}

export function parseCalculatorDraft(input: {
  salary: string;
  business: string;
  other: string;
  newOtherDeductions: string;
  section80C: string;
  section80D: string;
  hraExemption: string;
  housingLoanInterest: string;
  ageBand: string;
}):
  | { ok: true; data: CalculatorInput }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const salary = parseField(input.salary, "salary", errors);
  const business = parseField(input.business, "business", errors);
  const other = parseField(input.other, "other", errors);
  const newOtherDeductions = parseField(
    input.newOtherDeductions,
    "newOtherDeductions",
    errors
  );
  const section80C = parseField(input.section80C, "section80C", errors);
  const section80D = parseField(input.section80D, "section80D", errors);
  const hraExemption = parseField(input.hraExemption, "hraExemption", errors);
  const housingLoanInterest = parseField(
    input.housingLoanInterest,
    "housingLoanInterest",
    errors
  );

  if (!isAgeBand(input.ageBand)) {
    errors.ageBand = "Choose an age band.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      salary: salary ?? 0,
      business: business ?? 0,
      other: other ?? 0,
      ageBand: isAgeBand(input.ageBand) ? input.ageBand : "below_60",
      newOtherDeductions: newOtherDeductions ?? 0,
      section80C: section80C ?? 0,
      section80D: section80D ?? 0,
      hraExemption: hraExemption ?? 0,
      housingLoanInterest: housingLoanInterest ?? 0,
    },
  };
}

export function validateCalculatorInput(
  input: Parameters<typeof parseCalculatorDraft>[0]
):
  | { ok: true; data: CalculatorInput }
  | { ok: false; errors: Record<string, string> } {
  const parsed = parseCalculatorDraft(input);
  if (!parsed.ok) return parsed;
  if (parsed.data.salary + parsed.data.business + parsed.data.other === 0) {
    return {
      ok: false,
      errors: { form: "Enter at least one income amount." },
    };
  }
  return parsed;
}

export function validateTdsInput(input: {
  kind: string;
  amount: string;
  source: string;
  on: string;
}):
  | { ok: true; data: Omit<TdsEntry, "id"> }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const amount = parseField(input.amount, "amount", errors);
  const source = input.source.trim();
  const on = input.on.trim();

  if (input.kind !== "deducted" && input.kind !== "received") {
    errors.kind = "Choose deducted or received.";
  }
  if (amount === 0) errors.amount = "Enter a TDS amount greater than zero.";
  if (!source) errors.source = "Say who deducted or paid this TDS.";
  else if (source.length > 80) errors.source = "Keep the source under 80 characters.";
  if (!on) errors.on = "Pick the date this TDS was booked.";

  if (Object.keys(errors).length > 0 || amount === null) {
    return { ok: false, errors };
  }

  const kind: TdsKind = input.kind === "received" ? "received" : "deducted";

  return {
    ok: true,
    data: {
      kind,
      amount,
      source,
      on,
    },
  };
}

function parseField(value: string, key: string, errors: Record<string, string>) {
  const parsed = parseRupees(value);
  if (parsed === null) {
    errors[key] = "Enter a valid rupee amount.";
    return null;
  }
  return parsed;
}

function patchYear(
  userId: string,
  fyId: string,
  updater: (year: TaxYearRecord) => TaxYearRecord
) {
  const store = readStore();
  const current = store.byUser[userId]?.[fyId] ?? emptyYear(fyId);
  const next: TaxYearRecord = {
    ...updater(current),
    fyId,
    updatedAt: new Date().toISOString(),
  };
  store.byUser[userId] = { ...store.byUser[userId], [fyId]: next };
  writeStore(store);
  return next;
}

function readStore(): TaxStore {
  if (typeof window === "undefined") return { byUser: {} };
  try {
    const raw = window.localStorage.getItem(TAX_STORE_KEY);
    if (!raw) return { byUser: {} };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("byUser" in parsed)) {
      return { byUser: {} };
    }
    return parsed as TaxStore;
  } catch {
    return { byUser: {} };
  }
}

function writeStore(store: TaxStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TAX_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(TAX_CHANGE_EVENT));
}

export { emptyIncome, emptyCalculatorInput, computeTax };
