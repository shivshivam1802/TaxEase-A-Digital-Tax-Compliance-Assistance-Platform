import type { IncomeSnapshot } from "@/lib/tax-engine";
import type { VaultDocument } from "@/lib/documents";
import type { UserType } from "@/lib/user-type";

export const ITR_FORM_IDS = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"] as const;

export type ItrFormId = (typeof ITR_FORM_IDS)[number];

export type ItrDraft = {
  step: 1 | 2 | 3 | 4 | 5;
  formId: ItrFormId | null;
  resident: boolean;
  hasCapitalGains: boolean;
  moreThanOneHouse: boolean;
  hasForeignIncome: boolean;
  presumptive: boolean;
  bankAccount: string;
  ifsc: string;
  acceptGaps: boolean;
  acknowledgement: string | null;
  filedOn: string | null;
  verifiedOn: string | null;
};

export const ITR_FORMS: {
  id: ItrFormId;
  name: string;
  summary: string;
}[] = [
  {
    id: "ITR-1",
    name: "Sahaj",
    summary:
      "Resident individual. Salary, one house property, and other sources. Total income up to ₹50 lakh. No business or capital gains.",
  },
  {
    id: "ITR-2",
    name: "ITR-2",
    summary:
      "Individuals without business income — including capital gains, more than one house, foreign income, or total income above ₹50 lakh.",
  },
  {
    id: "ITR-3",
    name: "ITR-3",
    summary: "Individuals and HUFs with income from a business or profession (non-presumptive).",
  },
  {
    id: "ITR-4",
    name: "Sugam",
    summary:
      "Presumptive business or profession under ss. 44AD / 44ADA / 44AE, with total income up to ₹50 lakh.",
  },
];

export function emptyItrDraft(): ItrDraft {
  return {
    step: 1,
    formId: null,
    resident: true,
    hasCapitalGains: false,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: false,
    bankAccount: "",
    ifsc: "",
    acceptGaps: false,
    acknowledgement: null,
    filedOn: null,
    verifiedOn: null,
  };
}

export function isItrFormId(value: string): value is ItrFormId {
  return ITR_FORM_IDS.includes(value as ItrFormId);
}

export function grossIncome(income: IncomeSnapshot | null) {
  if (!income) return 0;
  return income.salary + income.business + income.other;
}

export function recommendItrForm(input: {
  income: IncomeSnapshot | null;
  resident: boolean;
  hasCapitalGains: boolean;
  moreThanOneHouse: boolean;
  hasForeignIncome: boolean;
  presumptive: boolean;
}): { formId: ItrFormId; reasons: string[] } {
  const income = input.income;
  const gross = grossIncome(income);
  const reasons: string[] = [];
  const salary = income?.salary ?? 0;
  const business = income?.business ?? 0;
  const other = income?.other ?? 0;

  if (!input.resident) {
    reasons.push("Non-residents cannot use ITR-1 Sahaj.");
    if (business > 0) {
      reasons.push("Business or professional income is reported on ITR-3.");
      return { formId: "ITR-3", reasons };
    }
    return { formId: "ITR-2", reasons };
  }

  if (business > 0) {
    if (input.presumptive && gross <= 50_00_000) {
      reasons.push("Presumptive business income with total income within ₹50 lakh points to ITR-4 Sugam.");
      return { formId: "ITR-4", reasons };
    }
    reasons.push("Business or professional income (other than presumptive) is reported on ITR-3.");
    return { formId: "ITR-3", reasons };
  }

  if (input.hasCapitalGains) reasons.push("Capital gains cannot go on ITR-1.");
  if (input.moreThanOneHouse) reasons.push("More than one house property cannot go on ITR-1.");
  if (input.hasForeignIncome) reasons.push("Foreign income cannot go on ITR-1.");
  if (gross > 50_00_000) reasons.push("Total income above ₹50 lakh cannot go on ITR-1 or ITR-4.");

  if (
    input.hasCapitalGains ||
    input.moreThanOneHouse ||
    input.hasForeignIncome ||
    gross > 50_00_000
  ) {
    return { formId: "ITR-2", reasons };
  }

  if (salary > 0) reasons.push("Salary income fits ITR-1 Sahaj when the other Sahaj conditions hold.");
  if (other > 0 && salary === 0) {
    reasons.push("Interest and other sources, with no business, fit ITR-1 Sahaj.");
  }
  if (reasons.length === 0) {
    reasons.push("Default for a resident individual without business income is ITR-1 Sahaj.");
  }
  return { formId: "ITR-1", reasons };
}

export type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  match: "pan" | VaultDocument["category"];
  reason: string;
};

export function itrChecklist(input: {
  formId: ItrFormId | null;
  income: IncomeSnapshot | null;
  userType: UserType;
  hasPan: boolean;
  documents: VaultDocument[];
}): { items: (ChecklistItem & { met: boolean })[]; missingRequired: number } {
  const salary = input.income?.salary ?? 0;
  const business = input.income?.business ?? 0;
  const items: ChecklistItem[] = [
    {
      id: "pan",
      label: "PAN on your profile",
      required: true,
      match: "pan",
      reason: "The return cannot be identified without a PAN.",
    },
    {
      id: "26as",
      label: "Form 26AS or AIS",
      required: true,
      match: "form26as",
      reason: "Reconcile TDS credit before you lock the return.",
    },
    {
      id: "bank",
      label: "Cancelled cheque or bank proof",
      required: true,
      match: "bank_proof",
      reason: "Needed for refund credit on the pre-filled bank account.",
    },
  ];

  if (salary > 0) {
    items.push({
      id: "form16",
      label: "Form 16",
      required: true,
      match: "form16",
      reason: "Salary TDS and perquisites come from Form 16 / Part B.",
    });
  }

  if (business > 0 || input.userType === "small_business") {
    items.push({
      id: "books",
      label: "Books, invoices, or presumptive working",
      required: input.formId === "ITR-3",
      match: "invoice",
      reason:
        input.formId === "ITR-4"
          ? "Keep the 44AD / 44ADA working with the pack even on Sugam."
          : "ITR-3 expects books and a profit computation.",
    });
  }

  items.push({
    id: "proofs",
    label: "Investment / deduction proofs",
    required: false,
    match: "investment_proof",
    reason: "Attach 80C / 80D papers if you are comparing or filing old regime.",
  });

  const categories = new Set(input.documents.map((doc) => doc.category));
  const withMet = items.map((item) => ({
    ...item,
    met: item.match === "pan" ? input.hasPan : categories.has(item.match),
  }));
  const missingRequired = withMet.filter((item) => item.required && !item.met).length;
  return { items: withMet, missingRequired };
}

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const ACCOUNT_PATTERN = /^\d{9,18}$/;

export function validateBankDetails(input: { bankAccount: string; ifsc: string }):
  | { ok: true; data: { bankAccount: string; ifsc: string } }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const bankAccount = input.bankAccount.replace(/\s+/g, "");
  const ifsc = input.ifsc.trim().toUpperCase();

  if (!ACCOUNT_PATTERN.test(bankAccount)) {
    errors.bankAccount = "Enter a 9–18 digit account number.";
  }
  if (!IFSC_PATTERN.test(ifsc)) {
    errors.ifsc = "IFSC should look like HDFC0001234.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { bankAccount, ifsc } };
}

export function validateFiling(input: {
  income: IncomeSnapshot | null;
  formId: ItrFormId | null;
  bankAccount: string;
  ifsc: string;
  missingRequired: number;
  acceptGaps: boolean;
}): { ok: true } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.income || grossIncome(input.income) === 0) {
    errors.form = "Record income before preparing the return.";
  }
  if (!input.formId) {
    errors.formId = "Choose an ITR form.";
  }
  const bank = validateBankDetails({
    bankAccount: input.bankAccount,
    ifsc: input.ifsc,
  });
  if (!bank.ok) Object.assign(errors, bank.errors);
  if (input.missingRequired > 0 && !input.acceptGaps) {
    errors.acceptGaps =
      "Upload the required papers, or confirm that you will attach them later.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

export function localAcknowledgement(now = new Date()) {
  const stamp = now.toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.abs(hashCode(`${stamp}:${now.getTime()}`)).toString(16).slice(0, 6);
  return `TAXEASE-${stamp}-${rand.toUpperCase()}`;
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
