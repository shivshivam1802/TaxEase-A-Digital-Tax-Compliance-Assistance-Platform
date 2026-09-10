import assert from "node:assert/strict";
import test from "node:test";

import { depositDueOn, quarterForDate, suggestedTds } from "./tds";
import { validateTdsInput } from "./tax-store";

test("suggested TDS rounds payment times rate", () => {
  assert.equal(suggestedTds(1_00_000, 0.1), 10_000);
  assert.equal(suggestedTds(1_00_000, 0.01), 1_000);
  assert.equal(suggestedTds(50_00_000, 0.001), 5_000);
});

test("TDS deposit is due on the 7th of the next month, or 30 April for March", () => {
  assert.equal(depositDueOn("2026-09-10"), "2026-10-07");
  assert.equal(depositDueOn("2027-03-15"), "2027-04-30");
  assert.equal(depositDueOn("2026-12-01"), "2027-01-07");
});

test("quarter mapping follows FY 2026–27", () => {
  assert.equal(quarterForDate("2026-05-01"), "Q1");
  assert.equal(quarterForDate("2026-09-10"), "Q2");
  assert.equal(quarterForDate("2026-11-02"), "Q3");
  assert.equal(quarterForDate("2027-02-01"), "Q4");
  assert.equal(quarterForDate("2025-12-01"), null);
});

test("TDS amount can be inferred from payment and rate", () => {
  const result = validateTdsInput({
    kind: "received",
    amount: "",
    source: "Studio retainers",
    on: "2026-09-10",
    section: "194J",
    paymentAmount: "1,00,000",
    ratePercent: "10",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.amount, 10_000);
    assert.equal(result.data.section, "194J");
    assert.equal(result.data.rate, 0.1);
    assert.equal(result.data.depositStatus, "pending");
  }
});

test("invalid PAN is rejected", () => {
  const result = validateTdsInput({
    kind: "deducted",
    amount: "5000",
    source: "HDFC Bank",
    on: "2026-09-10",
    pan: "12345",
  });
  assert.equal(result.ok, false);
});
