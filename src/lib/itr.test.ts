import assert from "node:assert/strict";
import test from "node:test";

import {
  recommendItrForm,
  validateBankDetails,
  validateFiling,
  itrChecklist,
  localAcknowledgement,
} from "./itr";

const salary = {
  salary: 12_75_000,
  business: 0,
  other: 0,
  deductions: 0,
};

test("resident salary year maps to ITR-1", () => {
  const result = recommendItrForm({
    income: salary,
    resident: true,
    hasCapitalGains: false,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: false,
  });
  assert.equal(result.formId, "ITR-1");
});

test("capital gains or income above 50 lakh maps to ITR-2", () => {
  const gains = recommendItrForm({
    income: salary,
    resident: true,
    hasCapitalGains: true,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: false,
  });
  assert.equal(gains.formId, "ITR-2");

  const high = recommendItrForm({
    income: { salary: 60_00_000, business: 0, other: 0, deductions: 0 },
    resident: true,
    hasCapitalGains: false,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: false,
  });
  assert.equal(high.formId, "ITR-2");
});

test("business income maps to ITR-3, or ITR-4 when presumptive", () => {
  const books = recommendItrForm({
    income: { salary: 0, business: 16_00_000, other: 0, deductions: 0 },
    resident: true,
    hasCapitalGains: false,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: false,
  });
  assert.equal(books.formId, "ITR-3");

  const sugam = recommendItrForm({
    income: { salary: 0, business: 16_00_000, other: 0, deductions: 0 },
    resident: true,
    hasCapitalGains: false,
    moreThanOneHouse: false,
    hasForeignIncome: false,
    presumptive: true,
  });
  assert.equal(sugam.formId, "ITR-4");
});

test("bank IFSC and account validation", () => {
  const bad = validateBankDetails({ bankAccount: "123", ifsc: "HDFC" });
  assert.equal(bad.ok, false);
  const good = validateBankDetails({ bankAccount: "12345678901", ifsc: "HDFC0001234" });
  assert.equal(good.ok, true);
});

test("filing is blocked without income, form, or bank details", () => {
  const result = validateFiling({
    income: null,
    formId: null,
    bankAccount: "",
    ifsc: "",
    missingRequired: 2,
    acceptGaps: false,
  });
  assert.equal(result.ok, false);
});

test("gaps can be accepted once bank and income are present", () => {
  const result = validateFiling({
    income: salary,
    formId: "ITR-1",
    bankAccount: "12345678901",
    ifsc: "HDFC0001234",
    missingRequired: 1,
    acceptGaps: true,
  });
  assert.equal(result.ok, true);
});

test("checklist requires PAN, 26AS, bank proof, and Form 16 for salary", () => {
  const result = itrChecklist({
    formId: "ITR-1",
    income: salary,
    userType: "individual",
    hasPan: false,
    documents: [],
  });
  assert.ok(result.missingRequired >= 3);
  assert.ok(result.items.some((item) => item.id === "form16" && !item.met));
});

test("local acknowledgement is a Niyam pack id, not a CPC token", () => {
  const ack = localAcknowledgement(new Date("2026-09-10T10:00:00.000Z"));
  assert.match(ack, /^NIYAM-20260910-[0-9A-F]+$/);
});
