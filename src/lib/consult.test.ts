import assert from "node:assert/strict";
import test from "node:test";

import {
  nextConsultStatus,
  PROFESSIONALS,
  validateConsultationInput,
} from "./consult";

test("consultation requires a listed CA, topic, date, and slot", () => {
  const bad = validateConsultationInput({
    professionalId: "unknown",
    topic: "",
    preferredOn: "",
    preferredSlot: "",
  });
  assert.equal(bad.ok, false);

  const good = validateConsultationInput({
    professionalId: PROFESSIONALS[0].id,
    topic: "Form 16 vs 26AS mismatch",
    preferredOn: "2026-09-18",
    preferredSlot: "morning",
    note: "Salary credit missing for Q1.",
  });
  assert.equal(good.ok, true);
});

test("status advances requested → confirmed → completed", () => {
  assert.equal(nextConsultStatus("requested"), "confirmed");
  assert.equal(nextConsultStatus("confirmed"), "completed");
  assert.equal(nextConsultStatus("completed"), null);
});
