/**
 * Common resident TDS sections and deposit / return dates for FY 2026–27.
 * Rates are the usual resident rates where PAN is furnished. Higher
 * “no PAN” rates and special 194J (2% technical) variants are left to
 * a manual rate override.
 */

export type TdsSection =
  | "192"
  | "194A"
  | "194C"
  | "194J"
  | "194H"
  | "194I"
  | "194Q"
  | "other";

export type TdsQuarterId = "Q1" | "Q2" | "Q3" | "Q4";

export type TdsReturnStatus = "not_started" | "filed" | "not_applicable";

export type TdsDepositStatus = "not_applicable" | "pending" | "deposited";

export type TdsSectionRule = {
  value: TdsSection;
  label: string;
  shortLabel: string;
  defaultRate: number | null;
  threshold: number;
  hint: string;
};

export const TDS_SECTIONS: TdsSectionRule[] = [
  {
    value: "192",
    label: "192 — Salary",
    shortLabel: "192",
    defaultRate: null,
    threshold: 0,
    hint: "As per slabs. Enter the TDS from Form 16 / Part A.",
  },
  {
    value: "194A",
    label: "194A — Interest",
    shortLabel: "194A",
    defaultRate: 0.1,
    threshold: 40_000,
    hint: "10%. Banks often apply a ₹40,000 threshold (₹50,000 for seniors).",
  },
  {
    value: "194C",
    label: "194C — Contractors",
    shortLabel: "194C",
    defaultRate: 0.01,
    threshold: 30_000,
    hint: "Default 1% (individual / HUF payee). Use 2% for others. Single bill ₹30,000 / year ₹1,00,000.",
  },
  {
    value: "194J",
    label: "194J — Professional fees",
    shortLabel: "194J",
    defaultRate: 0.1,
    threshold: 30_000,
    hint: "10% above ₹30,000. Technical services are often 2% — override the rate if so.",
  },
  {
    value: "194H",
    label: "194H — Commission",
    shortLabel: "194H",
    defaultRate: 0.02,
    threshold: 15_000,
    hint: "2% above ₹15,000.",
  },
  {
    value: "194I",
    label: "194I — Rent",
    shortLabel: "194I",
    defaultRate: 0.1,
    threshold: 2_40_000,
    hint: "10% for land / building; 2% for plant and machinery — override if needed. Threshold ₹2,40,000.",
  },
  {
    value: "194Q",
    label: "194Q — Purchase of goods",
    shortLabel: "194Q",
    defaultRate: 0.001,
    threshold: 50_00_000,
    hint: "0.1% when buyer turnover exceeds ₹10 crore and purchases exceed ₹50 lakh.",
  },
  {
    value: "other",
    label: "Other section",
    shortLabel: "Other",
    defaultRate: null,
    threshold: 0,
    hint: "Enter the rate and TDS from the invoice, challan, or Form 26AS.",
  },
];

export const TDS_QUARTERS: {
  id: TdsQuarterId;
  label: string;
  period: string;
  dueOn: string;
  formHint: string;
}[] = [
  {
    id: "Q1",
    label: "Q1",
    period: "Apr–Jun 2026",
    dueOn: "2026-07-31",
    formHint: "26Q / 24Q for April to June",
  },
  {
    id: "Q2",
    label: "Q2",
    period: "Jul–Sep 2026",
    dueOn: "2026-10-31",
    formHint: "26Q / 24Q for July to September",
  },
  {
    id: "Q3",
    label: "Q3",
    period: "Oct–Dec 2026",
    dueOn: "2027-01-31",
    formHint: "26Q / 24Q for October to December",
  },
  {
    id: "Q4",
    label: "Q4",
    period: "Jan–Mar 2027",
    dueOn: "2027-05-31",
    formHint: "26Q / 24Q for January to March",
  },
];

export const EMPTY_TDS_RETURNS: Record<TdsQuarterId, TdsReturnStatus> = {
  Q1: "not_started",
  Q2: "not_started",
  Q3: "not_started",
  Q4: "not_started",
};

export const TDS_RETURN_STATUSES: { value: TdsReturnStatus; label: string }[] = [
  { value: "not_started", label: "Not filed" },
  { value: "filed", label: "Filed" },
  { value: "not_applicable", label: "N/A" },
];

export type TdsKind = "deducted" | "received";

export type TdsEntry = {
  id: string;
  kind: TdsKind;
  amount: number;
  source: string;
  on: string;
  section?: TdsSection;
  paymentAmount?: number | null;
  rate?: number | null;
  pan?: string;
  note?: string;
  depositStatus?: TdsDepositStatus;
  depositedOn?: string | null;
};

export function getTdsSection(value: string): TdsSectionRule {
  return TDS_SECTIONS.find((item) => item.value === value) ?? TDS_SECTIONS[TDS_SECTIONS.length - 1];
}

export function isTdsSection(value: string): value is TdsSection {
  return TDS_SECTIONS.some((item) => item.value === value);
}
