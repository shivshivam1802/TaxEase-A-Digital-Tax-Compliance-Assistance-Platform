/**
 * Versioned Indian tax rules used by the dashboard estimate and the calculator.
 * FY 2026-27 / AY 2027-28.
 *
 * New regime (default under s.115BAC): Budget 2025 slab structure, s.87A rebate
 * up to ₹12 lakh, salaried standard deduction ₹75,000, Health & Education Cess 4%,
 * surcharge capped at 25% (no 37% slab).
 *
 * Old regime: pre-115BAC slabs, ₹50,000 standard deduction, s.87A up to ₹5 lakh,
 * Chapter VI-A deductions, surcharge up to 37% above ₹5 crore.
 *
 * Capital gains special rates, AMT, and firm/company slabs are out of scope.
 */

export const CURRENT_FY_ID = "FY2026-27";

export type TaxSlab = {
  upTo: number | null;
  rate: number;
};

export type RegimeId = "new" | "old";

export type AgeBand = "below_60" | "senior" | "super_senior";

export type SurchargeBracket = {
  above: number;
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
  surcharge: SurchargeBracket[];
  oldRegime: OldRegimeRules;
  source: string;
};

export type OldRegimeRules = {
  standardDeductionSalary: number;
  rebate87A: {
    maxTaxableIncome: number;
    maxRebate: number;
  };
  surcharge: SurchargeBracket[];
  basicExemption: Record<AgeBand, number>;
  section80CLimit: number;
  housingLoanInterestLimit: number;
  section80DLimit: Record<AgeBand, number>;
};

export const AGE_BANDS: { value: AgeBand; label: string; hint: string }[] = [
  { value: "below_60", label: "Under 60", hint: "Ordinary individual / HUF" },
  { value: "senior", label: "60–79", hint: "Senior citizen (old regime exemption ₹3 lakh)" },
  { value: "super_senior", label: "80 or older", hint: "Super senior (old regime exemption ₹5 lakh)" },
];

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
  surcharge: [
    { above: 2_00_00_000, rate: 0.25 },
    { above: 1_00_00_000, rate: 0.15 },
    { above: 50_00_000, rate: 0.1 },
  ],
  oldRegime: {
    standardDeductionSalary: 50_000,
    rebate87A: {
      maxTaxableIncome: 5_00_000,
      maxRebate: 12_500,
    },
    surcharge: [
      { above: 5_00_00_000, rate: 0.37 },
      { above: 2_00_00_000, rate: 0.25 },
      { above: 1_00_00_000, rate: 0.15 },
      { above: 50_00_000, rate: 0.1 },
    ],
    basicExemption: {
      below_60: 2_50_000,
      senior: 3_00_000,
      super_senior: 5_00_000,
    },
    section80CLimit: 1_50_000,
    housingLoanInterestLimit: 2_00_000,
    section80DLimit: {
      below_60: 25_000,
      senior: 50_000,
      super_senior: 50_000,
    },
  },
  source:
    "New regime default slabs for FY 2026-27; old regime comparison; s.87A; surcharge; 4% cess.",
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
    id: "itr-audit",
    title: "ITR filing (tax audit)",
    dueOn: "2027-10-31",
    kind: "itr",
    appliesTo: "small_business",
    note: "Return of income for AY 2027–28 where a tax audit report is required.",
  },
  {
    id: "itr-belated",
    title: "Belated / revised ITR",
    dueOn: "2027-12-31",
    kind: "itr",
    appliesTo: "all",
    note: "Last date to file a belated or revised return for AY 2027–28.",
  },
  {
    id: "tds-24q-q1",
    title: "TDS return Q1 (24Q / 26Q)",
    dueOn: "2026-07-31",
    kind: "tds",
    appliesTo: "small_business",
    note: "Quarterly statement for April–June 2026.",
  },
  {
    id: "tds-24q-q2",
    title: "TDS return Q2 (24Q / 26Q)",
    dueOn: "2026-10-31",
    kind: "tds",
    appliesTo: "small_business",
    note: "Quarterly statement for July–September 2026.",
  },
  {
    id: "tds-24q-q3",
    title: "TDS return Q3 (24Q / 26Q)",
    dueOn: "2027-01-31",
    kind: "tds",
    appliesTo: "small_business",
    note: "Quarterly statement for October–December 2026.",
  },
  {
    id: "tds-24q-q4",
    title: "TDS return Q4 (24Q / 26Q)",
    dueOn: "2027-05-31",
    kind: "tds",
    appliesTo: "small_business",
    note: "Quarterly statement for January–March 2027.",
  },
];

export function getRules(fyId = CURRENT_FY_ID) {
  if (fyId === FY_2026_27.id) return FY_2026_27;
  return FY_2026_27;
}

export function oldRegimeSlabs(ageBand: AgeBand, fyId?: string): TaxSlab[] {
  const exemption = getRules(fyId).oldRegime.basicExemption[ageBand];
  const slabs: TaxSlab[] = [{ upTo: exemption, rate: 0 }];
  if (exemption < 5_00_000) {
    slabs.push({ upTo: 5_00_000, rate: 0.05 });
  }
  slabs.push({ upTo: 10_00_000, rate: 0.2 });
  slabs.push({ upTo: null, rate: 0.3 });
  return slabs;
}

export function section80DLimit(ageBand: AgeBand, fyId?: string) {
  return getRules(fyId).oldRegime.section80DLimit[ageBand];
}
