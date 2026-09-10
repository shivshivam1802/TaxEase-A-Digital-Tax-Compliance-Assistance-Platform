import assert from "node:assert/strict";
import test from "node:test";

import { validateWaitlistInput } from "./waitlist";

test("rejects an empty waitlist request", () => {
  const result = validateWaitlistInput({
    name: "",
    email: "",
    userType: "",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.name, "Enter your full name.");
    assert.equal(result.errors.email, "Enter a work or personal email.");
    assert.equal(result.errors.userType, "Choose Individual or Small business.");
  }
});

test("accepts a valid individual request", () => {
  const result = validateWaitlistInput({
    name: "  Priya   Sharma ",
    email: "Priya@Studio.IN",
    userType: "individual",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.name, "Priya Sharma");
    assert.equal(result.data.email, "priya@studio.in");
    assert.equal(result.data.userType, "individual");
  }
});
