import { STATUTORY_DEADLINES, type StatutoryDeadline } from "@/lib/tax-rules";
import type { UserType } from "@/lib/user-type";
import { isoDate, todayIso } from "@/lib/dates";

export type PersonalReminder = {
  id: string;
  title: string;
  dueOn: string;
  note: string;
  doneOn: string | null;
};

export type CalendarKind = StatutoryDeadline["kind"] | "personal";

export type CalendarEvent = {
  id: string;
  title: string;
  dueOn: string;
  kind: CalendarKind;
  note: string;
  overdue: boolean;
  done: boolean;
  source: "statutory" | "personal";
  href?: string;
};

export function validateReminderInput(input: {
  title: string;
  dueOn: string;
  note?: string;
}):
  | { ok: true; data: Omit<PersonalReminder, "id" | "doneOn"> }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const dueOn = input.dueOn.trim();
  const note = (input.note ?? "").trim();

  if (!title) errors.title = "Name the reminder.";
  else if (title.length > 80) errors.title = "Keep the title under 80 characters.";
  if (!dueOn) errors.dueOn = "Pick a due date.";
  if (note.length > 160) errors.note = "Keep the note under 160 characters.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { title, dueOn, note } };
}

export function monthlyTdsDeposits(fyStartYear = 2026): StatutoryDeadline[] {
  const items: StatutoryDeadline[] = [];
  for (let i = 0; i < 12; i += 1) {
    const monthIndex = (3 + i) % 12;
    const year = 3 + i >= 12 ? fyStartYear + 1 : fyStartYear;
    const isMarch = monthIndex === 2;
    const dueOn = isMarch
      ? isoDate(fyStartYear + 1, 3, 30)
      : isoDate(year, monthIndex + 1, 7);
    const deductionMonth = isoDate(year, monthIndex, 1);
    items.push({
      id: `tds-dep-${deductionMonth.slice(0, 7)}`,
      title: `TDS deposit — ${monthName(monthIndex)}`,
      dueOn,
      kind: "tds",
      appliesTo: "small_business",
      note: isMarch
        ? "March deductions are due by 30 April."
        : `Deposit tax deducted in ${monthName(monthIndex)} by the 7th of the next month.`,
    });
  }
  return items;
}

export function allStatutoryDeadlines(): StatutoryDeadline[] {
  const monthly = monthlyTdsDeposits();
  const seen = new Set(STATUTORY_DEADLINES.map((item) => item.id));
  return [
    ...STATUTORY_DEADLINES,
    ...monthly.filter((item) => !seen.has(item.id)),
  ];
}

export function calendarEvents(input: {
  userType: UserType;
  reminders: PersonalReminder[];
  today?: string;
}): CalendarEvent[] {
  const today = input.today ?? todayIso();
  const statutory: CalendarEvent[] = allStatutoryDeadlines()
    .filter((item) => item.appliesTo === "all" || item.appliesTo === input.userType)
    .map((item) => ({
      id: item.id,
      title: item.title,
      dueOn: item.dueOn,
      kind: item.kind,
      note: item.note,
      overdue: item.dueOn < today,
      done: false,
      source: "statutory" as const,
      href: hrefForKind(item.kind),
    }));

  const personal: CalendarEvent[] = input.reminders.map((item) => ({
    id: item.id,
    title: item.title,
    dueOn: item.dueOn,
    kind: "personal" as const,
    note: item.note,
    overdue: !item.doneOn && item.dueOn < today,
    done: Boolean(item.doneOn),
    source: "personal" as const,
  }));

  return [...statutory, ...personal].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.dueOn.localeCompare(b.dueOn) || a.title.localeCompare(b.title);
  });
}

export function upcomingDeadlines(
  userType: UserType,
  reminders: PersonalReminder[] = [],
  today = todayIso()
) {
  return calendarEvents({ userType, reminders, today }).filter(
    (item) => !item.done && (item.overdue || item.dueOn >= today)
  );
}

function hrefForKind(kind: StatutoryDeadline["kind"]) {
  if (kind === "itr") return "/itr";
  if (kind === "tds") return "/tds";
  return "/calculator";
}

function monthName(monthIndex: number) {
  return new Date(2026, monthIndex, 1).toLocaleDateString("en-IN", { month: "long" });
}
