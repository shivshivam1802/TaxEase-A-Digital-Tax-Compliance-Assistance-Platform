/**
 * Versioned Indian tax rules used by the dashboard estimate.
 * FY 2026-27 / AY 2027-28 — new regime (default under s.115BAC).
 *
 * Sources encoded here: Budget 2025 slab structure (unchanged in Budget 2026
 * coverage), s.87A rebate up to ₹12 lakh, salaried standard deduction ₹75,000,
 * Health & Education Cess 4%.
 *
 * Surcharge and old-regime comparison are intentionally omitted until the
 * calculator module. Estimates above ₹50 lakh should be treated as incomplete.
 */

export const CURRENT_FY_ID = "FY2026-27";

export type TaxSlab = {
  upTo: number | null;
  rate: number;
};

export type FinancialYearRules = {
  id: string;
  label: string;
  assessmentYear: string;
  regime: "new";
  slabs: TaxSlab[];
  cessRate: number;
  standardDeductionSalary: number;
  rebate87A: {
    maxTaxableIncome: number;
    maxRebate: number;
  };
  source: string;
};

export const FY_2026_27: FinancialYearRules = {
  id: CURRENT_FY_ID,
  label: "FY 2026–27",
  assessmentYear: "AY 2027–28",
  regime: "new",
  slabs: [
    { upTo: 4_00_000, rate: 0 },
    { upTo: 8_00_000, rate: 0.05 },
    { upTo: 12_00_000, rate: 0.1 },
    { upTo: 16_00_000, rate: 0.15 },
    { upTo: 20_00_000, rate: 0.2 },
    { upTo: 24_00_000, rate: 0.25 },
    { upTo: null, rate: 0.3 },
  ],
  cessRate: 0.04,
  standardDeductionSalary: 75_000,
  rebate87A: {
    maxTaxableIncome: 12_00_000,
    maxRebate: 60_000,
  },
  source: "New regime default slabs for FY 2026-27; s.87A rebate; 4% cess.",
};

export type StatutoryDeadline = {
  id: string;
  title: string;
  dueOn: string;
  kind: "advance_tax" | "itr" | "tds";
  appliesTo: "all" | "individual" | "small_business";
  note: string;
};

export const STATUTORY_DEADLINES: StatutoryDeadline[] = [
  {
    id: "adv-q1",
    title: "Advance tax — 15%",
    dueOn: "2026-06-15",
    kind: "advance_tax",
    appliesTo: "all",
    note: "First instalment of estimated tax for FY 2026–27.",
  },
  {
    id: "adv-q2",
    title: "Advance tax — 45%",
    dueOn: "2026-09-15",
    kind: "advance_tax",
    appliesTo: "all",
    note: "Cumulative 45% of estimated tax for the year.",
  },
  {
    id: "adv-q3",
    title: "Advance tax — 75%",
    dueOn: "2026-12-15",
    kind: "advance_tax",
    appliesTo: "all",
    note: "Cumulative 75% of estimated tax for the year.",
  },
  {
    id: "adv-q4",
    title: "Advance tax — 100%",
    dueOn: "2027-03-15",
    kind: "advance_tax",
    appliesTo: "all",
    note: "Final instalment for FY 2026–27.",
  },
  {
    id: "itr-non-audit",
    title: "ITR filing (non-audit)",
    dueOn: "2027-07-31",
    kind: "itr",
    appliesTo: "all",
    note: "Return of income for AY 2027–28 where tax audit does not apply.",
  },
  {
    id: "tds-monthly",
    title: "TDS deposit (monthly)",
    dueOn: "2026-10-07",
    kind: "tds",
    appliesTo: "small_business",
    note: "Deposit tax deducted in September by the 7th of the following month.",
  },
];

export function getRules(fyId = CURRENT_FY_ID) {
  if (fyId === FY_2026_27.id) return FY_2026_27;
  return FY_2026_27;
}
