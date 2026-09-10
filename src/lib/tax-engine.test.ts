import assert from "node:assert/strict";
import test from "node:test";

import { computeTax } from "./tax-engine";
import { emptyYear, validateIncomeInput, validateTdsInput } from "./tax-store";

test("₹12 lakh taxable income is fully rebated under 87A", () => {
  const result = computeTax({
    salary: 0,
    business: 12_00_000,
    other: 0,
    deductions: 0,
  });

  assert.equal(result.taxableIncome, 12_00_000);
  assert.equal(result.slabTax, 60_000);
  assert.equal(result.rebate87A, 60_000);
  assert.equal(result.totalTax, 0);
});

test("salary of ₹12.75 lakh is tax-free after the standard deduction", () => {
  const result = computeTax({
    salary: 12_75_000,
    business: 0,
    other: 0,
    deductions: 0,
  });

  assert.equal(result.standardDeduction, 75_000);
  assert.equal(result.taxableIncome, 12_00_000);
  assert.equal(result.totalTax, 0);
});

test("₹16 lakh taxable pays slab tax plus 4% cess", () => {
  const result = computeTax({
    salary: 0,
    business: 16_00_000,
    other: 0,
    deductions: 0,
  });

  assert.equal(result.slabTax, 1_20_000);
  assert.equal(result.rebate87A, 0);
  assert.equal(result.cess, 4_800);
  assert.equal(result.totalTax, 1_24_800);
});

test("87A marginal relief caps tax just above ₹12 lakh", () => {
  const result = computeTax({
    salary: 0,
    business: 12_00_001,
    other: 0,
    deductions: 0,
  });

  assert.equal(result.taxAfterRebate, 1);
  assert.equal(result.cess, 0);
  assert.equal(result.totalTax, 1);
});

test("income validation requires a positive total", () => {
  const empty = validateIncomeInput({
    salary: "",
    business: "",
    other: "",
    deductions: "",
  });
  assert.equal(empty.ok, false);

  const bad = validateIncomeInput({
    salary: "abc",
    business: "",
    other: "",
    deductions: "",
  });
  assert.equal(bad.ok, false);

  const ok = validateIncomeInput({
    salary: "12,75,000",
    business: "",
    other: "",
    deductions: "0",
  });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.data.salary, 12_75_000);
});

test("TDS validation requires amount, source, and date", () => {
  const result = validateTdsInput({
    kind: "deducted",
    amount: "",
    source: "",
    on: "",
  });
  assert.equal(result.ok, false);
});

test("empty year snapshots are stable so the dashboard store can subscribe", () => {
  assert.equal(JSON.stringify(emptyYear()), JSON.stringify(emptyYear()));
});

test("TDS validation accepts a deducted line", () => {
  const result = validateTdsInput({
    kind: "deducted",
    amount: "50,000",
    source: "Acme Pvt Ltd",
    on: "2026-09-10",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.kind, "deducted");
    assert.equal(result.data.amount, 50_000);
  }
});
