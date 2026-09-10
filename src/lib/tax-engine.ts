import {
  getRules,
  oldRegimeSlabs,
  type AgeBand,
  type FinancialYearRules,
  type RegimeId,
  type SurchargeBracket,
  type TaxSlab,
} from "@/lib/tax-rules";

export type IncomeSnapshot = {
  salary: number;
  business: number;
  other: number;
  deductions: number;
};

export type CalculatorInput = {
  salary: number;
  business: number;
  other: number;
  ageBand: AgeBand;
  newOtherDeductions: number;
  section80C: number;
  section80D: number;
  hraExemption: number;
  housingLoanInterest: number;
};

export type DeductionLine = {
  label: string;
  amount: number;
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
  deductionLines: DeductionLine[];
  taxableIncome: number;
  slabTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRate: number;
  cess: number;
  totalTax: number;
  slabs: SlabLine[];
  rulesId: string;
  regime: RegimeId;
  ageBand: AgeBand;
};

export type RegimeComparison = {
  new: TaxComputation;
  old: TaxComputation;
  recommended: RegimeId | "tie";
  savings: number;
};

export function emptyIncome(): IncomeSnapshot {
  return { salary: 0, business: 0, other: 0, deductions: 0 };
}

export function emptyCalculatorInput(): CalculatorInput {
  return {
    salary: 0,
    business: 0,
    other: 0,
    ageBand: "below_60",
    newOtherDeductions: 0,
    section80C: 0,
    section80D: 0,
    hraExemption: 0,
    housingLoanInterest: 0,
  };
}

export function calculatorFromIncome(income: IncomeSnapshot): CalculatorInput {
  return {
    ...emptyCalculatorInput(),
    salary: income.salary,
    business: income.business,
    other: income.other,
    newOtherDeductions: income.deductions,
  };
}

export function incomeFromCalculator(input: CalculatorInput): IncomeSnapshot {
  return {
    salary: input.salary,
    business: input.business,
    other: input.other,
    deductions: input.newOtherDeductions,
  };
}

export function computeTax(
  income: IncomeSnapshot,
  fyId?: string
): TaxComputation {
  return computeRegimeTax(calculatorFromIncome(income), "new", fyId);
}

export function computeRegimeTax(
  input: CalculatorInput,
  regime: RegimeId,
  fyId?: string
): TaxComputation {
  const rules = getRules(fyId);
  const grossIncome = input.salary + input.business + input.other;
  const { standardDeduction, otherDeductions, deductionLines } =
    deductionsFor(input, regime, rules);
  const taxableIncome = Math.max(
    0,
    grossIncome - standardDeduction - otherDeductions
  );

  const slabs = regime === "new" ? rules.slabs : oldRegimeSlabs(input.ageBand, fyId);
  const rebateRules = regime === "new" ? rules.rebate87A : rules.oldRegime.rebate87A;
  const surchargeBrackets = regime === "new" ? rules.surcharge : rules.oldRegime.surcharge;

  const before = taxBeforeSurcharge(taxableIncome, slabs, rebateRules);
  const { surcharge, surchargeRate } = computeSurcharge(
    taxableIncome,
    before.taxAfterRebate,
    surchargeBrackets,
    slabs,
    rebateRules
  );
  const cess = Math.round((before.taxAfterRebate + surcharge) * rules.cessRate);
  const totalTax = before.taxAfterRebate + surcharge + cess;

  return {
    grossIncome,
    standardDeduction,
    otherDeductions,
    deductionLines,
    taxableIncome,
    slabTax: before.slabTax,
    rebate87A: before.rebate87A,
    taxAfterRebate: before.taxAfterRebate,
    surcharge,
    surchargeRate,
    cess,
    totalTax,
    slabs: before.slabs,
    rulesId: rules.id,
    regime,
    ageBand: input.ageBand,
  };
}

export function compareRegimes(
  input: CalculatorInput,
  fyId?: string
): RegimeComparison {
  const next = computeRegimeTax(input, "new", fyId);
  const old = computeRegimeTax(input, "old", fyId);
  const delta = old.totalTax - next.totalTax;
  if (delta === 0) {
    return { new: next, old, recommended: "tie", savings: 0 };
  }
  if (delta > 0) {
    return { new: next, old, recommended: "new", savings: delta };
  }
  return { new: next, old, recommended: "old", savings: -delta };
}

function deductionsFor(
  input: CalculatorInput,
  regime: RegimeId,
  rules: FinancialYearRules
) {
  const standardDeduction = Math.min(
    input.salary,
    input.salary > 0
      ? regime === "new"
        ? rules.standardDeductionSalary
        : rules.oldRegime.standardDeductionSalary
      : 0
  );

  if (regime === "new") {
    const otherDeductions = Math.min(
      Math.max(0, input.newOtherDeductions),
      Math.max(0, input.salary + input.business + input.other)
    );
    const deductionLines: DeductionLine[] = [];
    if (standardDeduction) {
      deductionLines.push({ label: "Standard deduction", amount: standardDeduction });
    }
    if (otherDeductions) {
      deductionLines.push({
        label: "Other new-regime deductions",
        amount: otherDeductions,
      });
    }
    return { standardDeduction, otherDeductions, deductionLines };
  }

  const section80C = Math.min(
    Math.max(0, input.section80C),
    rules.oldRegime.section80CLimit
  );
  const section80D = Math.min(
    Math.max(0, input.section80D),
    rules.oldRegime.section80DLimit[input.ageBand]
  );
  const hraExemption = Math.min(Math.max(0, input.hraExemption), input.salary);
  const housingLoanInterest = Math.min(
    Math.max(0, input.housingLoanInterest),
    rules.oldRegime.housingLoanInterestLimit
  );
  const otherDeductions = section80C + section80D + hraExemption + housingLoanInterest;
  const deductionLines: DeductionLine[] = [];
  if (standardDeduction) {
    deductionLines.push({ label: "Standard deduction", amount: standardDeduction });
  }
  if (section80C) deductionLines.push({ label: "s.80C", amount: section80C });
  if (section80D) deductionLines.push({ label: "s.80D", amount: section80D });
  if (hraExemption) deductionLines.push({ label: "HRA exemption", amount: hraExemption });
  if (housingLoanInterest) {
    deductionLines.push({
      label: "Housing loan interest (s.24b)",
      amount: housingLoanInterest,
    });
  }
  return { standardDeduction, otherDeductions, deductionLines };
}

function taxBeforeSurcharge(
  taxable: number,
  slabs: TaxSlab[],
  rebate87A: FinancialYearRules["rebate87A"]
) {
  const applied = applySlabs(taxable, slabs);
  const rebate = computeRebate(taxable, applied.slabTax, rebate87A);
  return {
    slabTax: applied.slabTax,
    rebate87A: rebate,
    taxAfterRebate: Math.max(0, applied.slabTax - rebate),
    slabs: applied.slabs,
  };
}

function computeSurcharge(
  taxable: number,
  taxAfterRebate: number,
  brackets: SurchargeBracket[],
  slabs: TaxSlab[],
  rebate87A: FinancialYearRules["rebate87A"]
) {
  const applicable = brackets.find((bracket) => taxable > bracket.above);
  if (!applicable || taxAfterRebate <= 0) {
    return { surcharge: 0, surchargeRate: 0 };
  }

  const unrelieved = Math.round(taxAfterRebate * applicable.rate);
  const atThreshold = taxBeforeSurcharge(applicable.above, slabs, rebate87A);
  const rateAtThreshold =
    brackets.find((bracket) => applicable.above > bracket.above)?.rate ?? 0;
  const surchargeAtThreshold = rateAtThreshold
    ? Math.round(atThreshold.taxAfterRebate * rateAtThreshold)
    : 0;
  const maxPayable =
    atThreshold.taxAfterRebate + surchargeAtThreshold + (taxable - applicable.above);
  const unrelievedTotal = taxAfterRebate + unrelieved;
  const surcharge =
    unrelievedTotal > maxPayable
      ? Math.max(0, maxPayable - taxAfterRebate)
      : unrelieved;

  return { surcharge, surchargeRate: applicable.rate };
}

function applySlabs(taxable: number, slabs: TaxSlab[]) {
  const lines: SlabLine[] = [];
  let remaining = taxable;
  let previousCap = 0;
  let slabTax = 0;

  for (const slab of slabs) {
    const cap = slab.upTo;
    const width = cap === null ? remaining : Math.max(0, Math.min(remaining, cap - previousCap));
    const tax = Math.round(width * slab.rate);
    lines.push({
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

  return { slabTax, slabs: lines };
}

function computeRebate(
  taxable: number,
  slabTax: number,
  rules: FinancialYearRules["rebate87A"]
) {
  const { maxTaxableIncome, maxRebate } = rules;

  if (taxable <= maxTaxableIncome) {
    return Math.min(slabTax, maxRebate);
  }

  const excess = taxable - maxTaxableIncome;
  if (slabTax > excess) {
    return slabTax - excess;
  }

  return 0;
}
