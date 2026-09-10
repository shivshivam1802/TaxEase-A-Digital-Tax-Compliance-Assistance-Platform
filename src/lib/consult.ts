export const CONSULT_STATUSES = [
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type ConsultStatus = (typeof CONSULT_STATUSES)[number]["value"];

export const CONSULT_SLOTS = [
  { value: "morning", label: "Morning (9:30–12:30)" },
  { value: "afternoon", label: "Afternoon (13:00–17:00)" },
  { value: "evening", label: "Evening (17:30–20:00)" },
] as const;

export type ConsultSlot = (typeof CONSULT_SLOTS)[number]["value"];

export type Professional = {
  id: string;
  name: string;
  city: string;
  membership: string;
  focus: string;
  fee: number;
  bio: string;
};

export type Consultation = {
  id: string;
  professionalId: string;
  topic: string;
  preferredOn: string;
  preferredSlot: ConsultSlot;
  note: string;
  status: ConsultStatus;
  shareFile: boolean;
  createdAt: string;
  updatedAt: string;
};

export const PROFESSIONALS: Professional[] = [
  {
    id: "ca-priya-mehta",
    name: "Priya Mehta",
    city: "Mumbai",
    membership: "M. No. 145821",
    focus: "Salary, ITR-1 / ITR-2, Form 16 mismatches",
    fee: 2_500,
    bio: "Twelve years with salaried filers and ESOP years. Speaks English, Hindi, and Marathi.",
  },
  {
    id: "ca-arjun-deshpande",
    name: "Arjun Deshpande",
    city: "Pune",
    membership: "M. No. 132044",
    focus: "Proprietors, TDS 26Q, GST overlap",
    fee: 3_500,
    bio: "Works with studios and traders who deduct TDS and need books that survive a notice.",
  },
  {
    id: "ca-kavitha-iyer",
    name: "Kavitha Iyer",
    city: "Bengaluru",
    membership: "M. No. 201118",
    focus: "ITR-3, tax audit, professional firms",
    fee: 4_000,
    bio: "Handles 44AD exits, audit reports, and multi-property years for tech founders.",
  },
  {
    id: "ca-rohan-kapoor",
    name: "Rohan Kapoor",
    city: "New Delhi",
    membership: "M. No. 178330",
    focus: "Notices, 26AS / AIS mismatch, refund follow-up",
    fee: 3_000,
    bio: "Former Big Four associate. Best when something already looks wrong on the portal.",
  },
  {
    id: "ca-farah-qureshi",
    name: "Farah Qureshi",
    city: "Hyderabad",
    membership: "M. No. 156902",
    focus: "Freelance, 44ADA, ITR-4 Sugam",
    fee: 2_000,
    bio: "Presumptive filings for designers, doctors, and consultants who want a clean Sugam year.",
  },
];

export function professionalById(id: string) {
  return PROFESSIONALS.find((item) => item.id === id) ?? null;
}

export function isConsultSlot(value: string): value is ConsultSlot {
  return CONSULT_SLOTS.some((item) => item.value === value);
}

export function isConsultStatus(value: string): value is ConsultStatus {
  return CONSULT_STATUSES.some((item) => item.value === value);
}

export function consultStatusLabel(status: ConsultStatus) {
  return CONSULT_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function validateConsultationInput(input: {
  professionalId: string;
  topic: string;
  preferredOn: string;
  preferredSlot: string;
  note?: string;
}):
  | {
      ok: true;
      data: Pick<
        Consultation,
        "professionalId" | "topic" | "preferredOn" | "preferredSlot" | "note"
      >;
    }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const topic = input.topic.trim();
  const preferredOn = input.preferredOn.trim();
  const note = (input.note ?? "").trim();

  if (!professionalById(input.professionalId)) {
    errors.professionalId = "Choose a professional from the list.";
  }
  if (!topic) errors.topic = "Say what you want to cover.";
  else if (topic.length > 80) errors.topic = "Keep the topic under 80 characters.";
  if (!preferredOn) errors.preferredOn = "Pick a preferred date.";
  if (!isConsultSlot(input.preferredSlot)) {
    errors.preferredSlot = "Choose a time of day.";
  }
  if (note.length > 240) errors.note = "Keep the brief under 240 characters.";

  if (Object.keys(errors).length > 0 || !isConsultSlot(input.preferredSlot)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      professionalId: input.professionalId,
      topic,
      preferredOn,
      preferredSlot: input.preferredSlot,
      note,
    },
  };
}

export function nextConsultStatus(status: ConsultStatus): ConsultStatus | null {
  if (status === "requested") return "confirmed";
  if (status === "confirmed") return "completed";
  return null;
}
