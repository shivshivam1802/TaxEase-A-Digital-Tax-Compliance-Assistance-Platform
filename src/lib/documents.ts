export const DOC_CATEGORIES = [
  { value: "form16", label: "Form 16" },
  { value: "form26as", label: "Form 26AS / AIS" },
  { value: "tds_certificate", label: "TDS certificate" },
  { value: "invoice", label: "Invoice / books" },
  { value: "investment_proof", label: "Investment proof" },
  { value: "bank_proof", label: "Bank proof" },
  { value: "itr_ack", label: "ITR acknowledgement" },
  { value: "notice", label: "Notice / order" },
  { value: "other", label: "Other" },
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number]["value"];

export type VaultDocument = {
  id: string;
  name: string;
  category: DocCategory;
  issuedOn: string;
  notes: string;
  mime: string;
  size: number;
  dataUrl: string | null;
  createdAt: string;
};

export const MAX_DOC_BYTES = 750_000;
export const MAX_VAULT_BYTES = 3_000_000;

export function isDocCategory(value: string): value is DocCategory {
  return DOC_CATEGORIES.some((item) => item.value === value);
}

export function categoryLabel(category: DocCategory) {
  return DOC_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export function vaultBytes(documents: VaultDocument[]) {
  return documents.reduce((sum, doc) => sum + doc.size, 0);
}

export function validateDocumentInput(input: {
  name: string;
  category: string;
  issuedOn: string;
  notes?: string;
  mime?: string;
  size?: number;
  dataUrl?: string | null;
}):
  | { ok: true; data: Omit<VaultDocument, "id" | "createdAt"> }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const notes = (input.notes ?? "").trim();
  const issuedOn = input.issuedOn.trim();
  const mime = (input.mime ?? "").trim();
  const size = input.size ?? 0;
  const dataUrl = input.dataUrl ?? null;

  if (!name) errors.name = "Give the file a name.";
  else if (name.length > 80) errors.name = "Keep the name under 80 characters.";
  if (!isDocCategory(input.category)) errors.category = "Choose a document type.";
  if (!issuedOn) errors.issuedOn = "Enter the issue or period date.";
  if (notes.length > 160) errors.notes = "Keep the note under 160 characters.";
  if (dataUrl) {
    if (size <= 0) errors.file = "The attached file looks empty.";
    if (size > MAX_DOC_BYTES) {
      errors.file = "Keep each file under 750 KB in this browser vault.";
    }
  }

  if (Object.keys(errors).length > 0 || !isDocCategory(input.category)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      category: input.category,
      issuedOn,
      notes,
      mime: mime || "application/octet-stream",
      size,
      dataUrl,
    },
  };
}

export function searchDocuments(
  documents: VaultDocument[],
  query: string,
  category: DocCategory | "all"
) {
  const needle = query.trim().toLowerCase();
  return documents.filter((doc) => {
    if (category !== "all" && doc.category !== category) return false;
    if (!needle) return true;
    return (
      doc.name.toLowerCase().includes(needle) ||
      doc.notes.toLowerCase().includes(needle) ||
      categoryLabel(doc.category).toLowerCase().includes(needle)
    );
  });
}
