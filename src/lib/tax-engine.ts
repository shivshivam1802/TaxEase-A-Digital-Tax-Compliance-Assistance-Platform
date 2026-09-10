import { getRules, type FinancialYearRules } from "@/lib/tax-rules";

export type IncomeSnapshot = {
  salary: number;
  business: number;
  other: number;
  deductions: number;
};

export type SlabLine = {
  from: number;
  to: number | null;
  rate: number;
  tax: number;
};

export type TaxComputation = {
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
  slabs: SlabLine[];
  rulesId: string;
  regime: FinancialYearRules["regime"];
};

export function emptyIncome(): IncomeSnapshot {
  return { salary: 0, business: 0, other: 0, deductions: 0 };
}

export function computeTax(
  income: IncomeSnapshot,
  fyId?: string
): TaxComputation {
  const rules = getRules(fyId);
  const grossIncome = income.salary + income.business + income.other;
  const standardDeduction = Math.min(
    income.salary,
    income.salary > 0 ? rules.standardDeductionSalary : 0
  );
  const otherDeductions = Math.min(income.deductions, Math.max(0, grossIncome));
  const taxableIncome = Math.max(
    0,
    grossIncome - standardDeduction - otherDeductions
  );

  const { slabTax, slabs } = applySlabs(taxableIncome, rules);
  const rebate87A = computeRebate(taxableIncome, slabTax, rules);
  const taxAfterRebate = Math.max(0, slabTax - rebate87A);
  const cess = Math.round(taxAfterRebate * rules.cessRate);
  const totalTax = taxAfterRebate + cess;

  return {
    grossIncome,
    standardDeduction,
    otherDeductions,
    taxableIncome,
    slabTax,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTax,
    slabs,
    rulesId: rules.id,
    regime: rules.regime,
  };
}

function applySlabs(taxable: number, rules: FinancialYearRules) {
  const slabs: SlabLine[] = [];
  let remaining = taxable;
  let previousCap = 0;
  let slabTax = 0;

  for (const slab of rules.slabs) {
    const cap = slab.upTo;
    const width = cap === null ? remaining : Math.max(0, Math.min(remaining, cap - previousCap));
    const tax = Math.round(width * slab.rate);
    slabs.push({
      from: previousCap,
      to: cap,
      rate: slab.rate,
      tax,
    });
    slabTax += tax;
    remaining -= width;
    previousCap = cap ?? previousCap;
    if (remaining <= 0) break;
  }

  return { slabTax, slabs };
}

function computeRebate(
  taxable: number,
  slabTax: number,
  rules: FinancialYearRules
) {
  const { maxTaxableIncome, maxRebate } = rules.rebate87A;

  if (taxable <= maxTaxableIncome) {
    return Math.min(slabTax, maxRebate);
  }

  const excess = taxable - maxTaxableIncome;
  if (slabTax > excess) {
    return slabTax - excess;
  }

  return 0;
}
