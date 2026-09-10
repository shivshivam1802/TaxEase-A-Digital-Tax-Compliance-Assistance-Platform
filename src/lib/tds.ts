import {
  EMPTY_TDS_RETURNS,
  TDS_QUARTERS,
  getTdsSection,
  type TdsDepositStatus,
  type TdsEntry,
  type TdsKind,
  type TdsQuarterId,
  type TdsReturnStatus,
  type TdsSection,
} from "@/lib/tds-rules";

export type NormalizedTds = {
  id: string;
  kind: TdsKind;
  amount: number;
  source: string;
  on: string;
  section: TdsSection;
  paymentAmount: number | null;
  rate: number | null;
  pan: string;
  note: string;
  depositStatus: TdsDepositStatus;
  depositedOn: string | null;
};

export function normalizeTds(entry: TdsEntry): NormalizedTds {
  const kind = entry.kind;
  return {
    id: entry.id,
    kind,
    amount: entry.amount,
    source: entry.source,
    on: entry.on,
    section: entry.section ?? "other",
    paymentAmount: entry.paymentAmount ?? null,
    rate: entry.rate ?? null,
    pan: entry.pan ?? "",
    note: entry.note ?? "",
    depositStatus:
      entry.depositStatus ?? (kind === "received" ? "pending" : "not_applicable"),
    depositedOn: entry.depositedOn ?? null,
  };
}

export function suggestedTds(paymentAmount: number, rate: number) {
  if (paymentAmount <= 0 || rate <= 0) return 0;
  return Math.round(paymentAmount * rate);
}

export function rateFromPercent(percent: number) {
  return percent / 100;
}

export function percentFromRate(rate: number) {
  const percent = rate * 100;
  const digits = Number.isInteger(percent) ? 0 : percent < 1 ? 2 : 2;
  return Number(percent.toFixed(digits));
}

export function depositDueOn(iso: string): string {
  const [yearStr, monthStr] = iso.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return iso;
  if (month === 3) return `${year}-04-30`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-07`;
}

export function quarterForDate(iso: string): TdsQuarterId | null {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  if (year === 2026 && month >= 4 && month <= 6) return "Q1";
  if (year === 2026 && month >= 7 && month <= 9) return "Q2";
  if (year === 2026 && month >= 10) return "Q3";
  if (year === 2027 && month >= 1 && month <= 3) return "Q4";
  return null;
}

export function tdsKindLabel(kind: TdsKind) {
  return kind === "deducted" ? "Credit (from you)" : "You deducted";
}

export function sectionLabel(section: TdsSection) {
  return getTdsSection(section).shortLabel;
}

export function tdsOverview(
  entries: TdsEntry[],
  estimatedTax: number | null,
  today = new Date().toISOString().slice(0, 10)
) {
  const lines = entries.map(normalizeTds);
  const deducted = lines
    .filter((line) => line.kind === "deducted")
    .reduce((sum, line) => sum + line.amount, 0);
  const collected = lines
    .filter((line) => line.kind === "received")
    .reduce((sum, line) => sum + line.amount, 0);
  const pendingDeposit = lines
    .filter((line) => line.kind === "received" && line.depositStatus === "pending")
    .reduce((sum, line) => sum + line.amount, 0);
  const overdue = lines.filter((line) => {
    if (line.kind !== "received" || line.depositStatus !== "pending") return false;
    return depositDueOn(line.on) < today;
  });
  const remaining =
    estimatedTax === null ? null : Math.max(0, estimatedTax - deducted);
  const covered =
    remaining === null || remaining + deducted === 0
      ? 0
      : Math.min(100, Math.round((deducted / (deducted + remaining)) * 100));

  return {
    deducted,
    collected,
    pendingDeposit,
    overdue,
    remaining,
    covered,
  };
}

export function returnsFor(year: {
  tdsReturns?: Record<TdsQuarterId, TdsReturnStatus> | null;
}) {
  const stored = year.tdsReturns ?? EMPTY_TDS_RETURNS;
  return TDS_QUARTERS.map((quarter) => ({
    ...quarter,
    status: stored[quarter.id] ?? "not_started",
  }));
}

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
