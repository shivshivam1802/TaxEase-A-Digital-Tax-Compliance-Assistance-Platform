"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { calendarEvents, validateReminderInput, type CalendarEvent } from "@/lib/calendar";
import { formatIndianDate, todayIso } from "@/lib/dates";
import { FY_2026_27 } from "@/lib/tax-rules";
import { addReminder, removeReminder, setReminderDone } from "@/lib/tax-store";
import { cn } from "@/lib/utils";

type Filter = "upcoming" | "overdue" | "done" | "all";

export function CalendarHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [open, setOpen] = useState(false);
  const today = todayIso();

  const events = useMemo(
    () =>
      calendarEvents({
        userType: user?.userType ?? "individual",
        reminders: year.reminders ?? [],
        today,
      }),
    [today, user?.userType, year.reminders]
  );

  const visible = events.filter((item) => {
    if (filter === "all") return true;
    if (filter === "done") return item.done;
    if (filter === "overdue") return item.overdue && !item.done;
    return !item.done;
  });

  if (!user) return null;

  const overdue = events.filter((item) => item.overdue && !item.done).length;
  const openCount = events.filter((item) => !item.done).length;

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Compliance calendar
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Dates for {FY_2026_27.label}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Statutory advance tax, ITR, and TDS dates sit next to reminders you
            add. Today is {formatIndianDate(today)}.
          </p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={() => setOpen(true)}>
          <Plus /> Add reminder
        </Button>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Open" value={String(openCount)} hint="Statutory and personal" />
        <Stat label="Overdue" value={String(overdue)} hint="Still unmarked" />
        <Stat
          label="ITR (non-audit)"
          value={formatIndianDate("2027-07-31")}
          hint="AY 2027–28"
        />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["upcoming", "Upcoming"],
            ["overdue", "Overdue"],
            ["done", "Done"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={filter === value ? "default" : "outline"}
            className="h-8"
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          Nothing in this view. Add a personal reminder or switch filters.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {visible.map((item) => (
            <EventRow
              key={item.id}
              item={item}
              userId={user.id}
              fyId={year.fyId}
            />
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[min(100%,24rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Personal reminder</SheetTitle>
            <SheetDescription>
              Stored with this financial year. Mark it done from the list.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <ReminderForm
              userId={user.id}
              fyId={year.fyId}
              onSaved={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function EventRow({
  item,
  userId,
  fyId,
}: {
  item: CalendarEvent;
  userId: string;
  fyId: string;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <p className="font-medium">{item.title}</p>
          <Badge
            variant={
              item.done ? "secondary" : item.overdue ? "destructive" : "outline"
            }
          >
            {item.done ? "Done" : item.overdue ? "Overdue" : formatIndianDate(item.dueOn)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
        {!item.done ? (
          <p className="mt-1 text-xs text-muted-foreground">{formatIndianDate(item.dueOn)}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {item.href ? (
          <Link href={item.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}>
            Open
          </Link>
        ) : null}
        {item.source === "personal" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setReminderDone(userId, item.id, !item.done, fyId)}
            >
              {item.done ? "Reopen" : "Mark done"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              aria-label={`Delete ${item.title}`}
              onClick={() => removeReminder(userId, item.id, fyId)}
            >
              <Trash2 />
            </Button>
          </>
        ) : null}
      </div>
    </li>
  );
}

function ReminderForm({
  userId,
  fyId,
  onSaved,
}: {
  userId: string;
  fyId: string;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = validateReminderInput({ title, dueOn, note });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    addReminder(userId, parsed.data, fyId);
    onSaved();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="rem-title">Title</Label>
        <Input
          id="rem-title"
          className="h-10"
          value={title}
          aria-invalid={Boolean(errors.title)}
          onValueChange={setTitle}
        />
        {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rem-due">Due on</Label>
        <Input
          id="rem-due"
          type="date"
          className="h-10"
          value={dueOn}
          aria-invalid={Boolean(errors.dueOn)}
          onValueChange={setDueOn}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rem-note">Note</Label>
        <Textarea id="rem-note" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <Button type="submit" className="h-11 w-full">
        Save reminder
      </Button>
    </form>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-heading text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
