"use client";

import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { useTaxYear } from "@/components/dashboard/use-tax-year";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  CONSULT_SLOTS,
  PROFESSIONALS,
  consultStatusLabel,
  nextConsultStatus,
  professionalById,
  validateConsultationInput,
  type Professional,
} from "@/lib/consult";
import { formatIndianDate } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import {
  addConsultation,
  setConsultStatus,
  updateConsultation,
} from "@/lib/tax-store";

export function CaHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [selected, setSelected] = useState<Professional | null>(null);

  const consultations = year.consultations ?? [];
  const openCount = consultations.filter(
    (item) => item.status === "requested" || item.status === "confirmed"
  ).length;
  const sharing = consultations.filter(
    (item) => item.shareFile && item.status !== "cancelled" && item.status !== "completed"
  ).length;

  if (!user) return null;

  return (
    <AppShell>
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          CA desk
        </p>
        <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          Professionals on TaxEase
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Request a slot, share this year’s file only if you want, and track
          status here. Fees are paid directly to the CA — TaxEase does not collect
          them.
        </p>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Open requests" value={String(openCount)} hint="Requested or confirmed" />
        <Stat label="File shared" value={String(sharing)} hint="Revoke from a booking" />
        <Stat label="On the roster" value={String(PROFESSIONALS.length)} hint="Independent CAs" />
      </section>

      <ul className="mt-8 grid gap-3 lg:grid-cols-2">
        {PROFESSIONALS.map((person) => (
          <li key={person.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-medium">{person.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {person.city} · {person.membership}
                </p>
              </div>
              <Badge variant="secondary">{formatINR(person.fee)}</Badge>
            </div>
            <p className="mt-3 text-sm font-medium">{person.focus}</p>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{person.bio}</p>
            <Button
              type="button"
              className="mt-4 h-10"
              onClick={() => setSelected(person)}
            >
              Request consultation
            </Button>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-medium">Your consultations</h2>
        {consultations.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No requests yet. Pick a professional above — every button here
            creates a real booking on this account.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {consultations.map((item) => {
              const person = professionalById(item.professionalId);
              const next = nextConsultStatus(item.status);
              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{person?.name ?? "Professional"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.topic} · {formatIndianDate(item.preferredOn)} ·{" "}
                        {CONSULT_SLOTS.find((slot) => slot.value === item.preferredSlot)?.label}
                      </p>
                      {item.note ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                      ) : null}
                    </div>
                    <Badge
                      variant={
                        item.status === "cancelled"
                          ? "destructive"
                          : item.status === "completed"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {consultStatusLabel(item.status)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {next ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8"
                        onClick={() => setConsultStatus(user.id, item.id, next, year.fyId)}
                      >
                        {next === "confirmed" ? "Confirm slot" : "Mark completed"}
                      </Button>
                    ) : null}
                    {item.status === "requested" || item.status === "confirmed" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          setConsultStatus(user.id, item.id, "cancelled", year.fyId)
                        }
                      >
                        Cancel
                      </Button>
                    ) : null}
                    {item.status !== "cancelled" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          updateConsultation(
                            user.id,
                            item.id,
                            { shareFile: !item.shareFile },
                            year.fyId
                          )
                        }
                      >
                        {item.shareFile ? "Revoke file access" : "Share this year’s file"}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-[min(100%,26rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Request {selected?.name}</SheetTitle>
            <SheetDescription>
              {selected
                ? `${selected.city} · ${formatINR(selected.fee)} consultation. Pay the CA directly.`
                : "Choose a date and say what you need."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {selected ? (
              <RequestForm
                professional={selected}
                userId={user.id}
                fyId={year.fyId}
                onSaved={() => setSelected(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function RequestForm({
  professional,
  userId,
  fyId,
  onSaved,
}: {
  professional: Professional;
  userId: string;
  fyId: string;
  onSaved: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [preferredOn, setPreferredOn] = useState("");
  const [preferredSlot, setPreferredSlot] = useState(CONSULT_SLOTS[0].value);
  const [note, setNote] = useState("");
  const [shareFile, setShareFile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = validateConsultationInput({
      professionalId: professional.id,
      topic,
      preferredOn,
      preferredSlot,
      note,
    });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    addConsultation(userId, { ...parsed.data, shareFile }, fyId);
    onSaved();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="ca-topic">Topic</Label>
        <Input
          id="ca-topic"
          className="h-10"
          value={topic}
          aria-invalid={Boolean(errors.topic)}
          onValueChange={setTopic}
          placeholder="26AS mismatch, ITR-3 books…"
        />
        {errors.topic ? <p className="text-xs text-destructive">{errors.topic}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ca-date">Preferred date</Label>
        <Input
          id="ca-date"
          type="date"
          className="h-10"
          value={preferredOn}
          onValueChange={setPreferredOn}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ca-slot">Time of day</Label>
        <select
          id="ca-slot"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={preferredSlot}
          onChange={(event) => setPreferredSlot(event.target.value as typeof preferredSlot)}
        >
          {CONSULT_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ca-note">Brief</Label>
        <Textarea id="ca-note" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          checked={shareFile}
          onChange={(event) => setShareFile(event.target.checked)}
        />
        <span className="text-sm leading-6">
          Share this year’s TaxEase file (income, TDS, documents) with {professional.name}. You
          can revoke it later.
        </span>
      </label>
      <Button type="submit" className="h-11 w-full">
        Send request
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
