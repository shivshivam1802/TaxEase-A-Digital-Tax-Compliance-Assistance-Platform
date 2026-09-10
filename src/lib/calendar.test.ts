import assert from "node:assert/strict";
import test from "node:test";

import {
  calendarEvents,
  monthlyTdsDeposits,
  upcomingDeadlines,
  validateReminderInput,
} from "./calendar";

test("April TDS is due on 7 May; March TDS on 30 April", () => {
  const deposits = monthlyTdsDeposits(2026);
  assert.equal(deposits[0].dueOn, "2026-05-07");
  assert.equal(deposits[0].title.includes("April"), true);
  const march = deposits.find((item) => item.title.includes("March"));
  assert.equal(march?.dueOn, "2027-04-30");
});

test("upcoming list includes overdue statutory dates and skips completed reminders", () => {
  const events = upcomingDeadlines(
    "individual",
    [
      {
        id: "r1",
        title: "Scan Form 16",
        dueOn: "2026-09-01",
        note: "",
        doneOn: "2026-09-02",
      },
      {
        id: "r2",
        title: "Call CA",
        dueOn: "2026-09-20",
        note: "",
        doneOn: null,
      },
    ],
    "2026-09-10"
  );
  assert.ok(events.some((item) => item.id === "r2"));
  assert.ok(!events.some((item) => item.id === "r1"));
  assert.ok(events.some((item) => item.id === "adv-q1" && item.overdue));
});

test("small businesses see TDS return dates", () => {
  const events = calendarEvents({
    userType: "small_business",
    reminders: [],
    today: "2026-09-10",
  });
  assert.ok(events.some((item) => item.id === "tds-24q-q2"));
  const individual = calendarEvents({
    userType: "individual",
    reminders: [],
    today: "2026-09-10",
  });
  assert.ok(!individual.some((item) => item.id === "tds-24q-q2"));
});

test("reminder validation", () => {
  const bad = validateReminderInput({ title: "", dueOn: "" });
  assert.equal(bad.ok, false);
  const good = validateReminderInput({
    title: "Pay advance tax",
    dueOn: "2026-09-15",
    note: "Q2",
  });
  assert.equal(good.ok, true);
});
