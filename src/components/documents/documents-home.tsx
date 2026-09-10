"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Download, FolderClosed, Plus, Trash2 } from "lucide-react";

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
import { formatIndianDate } from "@/lib/dates";
import {
  DOC_CATEGORIES,
  MAX_DOC_BYTES,
  MAX_VAULT_BYTES,
  categoryLabel,
  searchDocuments,
  validateDocumentInput,
  vaultBytes,
  type DocCategory,
} from "@/lib/documents";
import { FY_2026_27 } from "@/lib/tax-rules";
import { addDocument, removeDocument } from "@/lib/tax-store";

export function DocumentsHome() {
  const { user } = useAuth();
  const year = useTaxYear(user?.id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DocCategory | "all">("all");
  const [open, setOpen] = useState(false);

  const documents = useMemo(() => year.documents ?? [], [year.documents]);
  const visible = useMemo(
    () => searchDocuments(documents, query, category),
    [category, documents, query]
  );

  if (!user) return null;

  const used = vaultBytes(documents);

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Document vault
          </p>
          <h1 className="mt-2 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {FY_2026_27.label} papers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Form 16, 26AS, invoices, and proofs live with this year. Files stay
            in this browser (750 KB each, 3 MB vault).
          </p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={() => setOpen(true)}>
          <Plus /> Add document
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Vault {Math.round(used / 1024)} KB of {Math.round(MAX_VAULT_BYTES / 1024)} KB
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          className="h-10 sm:max-w-xs"
          placeholder="Search name or note"
          value={query}
          onValueChange={setQuery}
          aria-label="Search documents"
        />
        <select
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={category}
          onChange={(event) => setCategory(event.target.value as DocCategory | "all")}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {DOC_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
          <FolderClosed className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-heading text-xl font-medium">
            {documents.length === 0 ? "Nothing on file yet" : "No matches"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {documents.length === 0
              ? "Add Form 16, 26AS, or a bank proof so the ITR assistant can tick them off."
              : "Try another search or type."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {visible.map((doc) => (
            <li key={doc.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoryLabel(doc.category)} · {formatIndianDate(doc.issuedOn)}
                    {doc.size ? ` · ${Math.max(1, Math.round(doc.size / 1024))} KB` : ""}
                  </p>
                </div>
                <Badge variant="outline">{doc.dataUrl ? "File" : "Record"}</Badge>
              </div>
              {doc.notes ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{doc.notes}</p>
              ) : null}
              <div className="mt-3 flex gap-2">
                {doc.dataUrl ? (
                  <a
                    href={doc.dataUrl}
                    download={doc.name}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                  >
                    <Download className="size-4" /> Download
                  </a>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9"
                  aria-label={`Delete ${doc.name}`}
                  onClick={() => removeDocument(user.id, doc.id, year.fyId)}
                >
                  <Trash2 /> Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[min(100%,26rem)] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add document</SheetTitle>
            <SheetDescription>
              Metadata is required. Attach a file only if it fits the vault limit.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <DocumentForm
              used={used}
              onSaved={() => setOpen(false)}
              userId={user.id}
              fyId={year.fyId}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function DocumentForm({
  userId,
  fyId,
  used,
  onSaved,
}: {
  userId: string;
  fyId: string;
  used: number;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocCategory>("form16");
  const [issuedOn, setIssuedOn] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<{
    mime: string;
    size: number;
    dataUrl: string;
    name: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onFile(list: FileList | null) {
    const next = list?.[0];
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_DOC_BYTES) {
      setErrors({ file: "Keep each file under 750 KB." });
      setFile(null);
      return;
    }
    const dataUrl = await readDataUrl(next);
    setFile({
      mime: next.type || "application/octet-stream",
      size: next.size,
      dataUrl,
      name: next.name,
    });
    setErrors({});
    if (!name) setName(next.name.replace(/\.[^.]+$/, "").slice(0, 80));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const parsed = validateDocumentInput({
      name,
      category,
      issuedOn,
      notes,
      mime: file?.mime,
      size: file?.size,
      dataUrl: file?.dataUrl ?? null,
    });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setBusy(false);
      return;
    }
    if (used + parsed.data.size > MAX_VAULT_BYTES) {
      setErrors({ file: "This vault is full. Remove an older file first." });
      setBusy(false);
      return;
    }
    addDocument(userId, parsed.data, fyId);
    setBusy(false);
    onSaved();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="doc-name">Name</Label>
        <Input
          id="doc-name"
          className="h-10"
          value={name}
          aria-invalid={Boolean(errors.name)}
          onValueChange={setName}
        />
        {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-cat">Type</Label>
        <select
          id="doc-cat"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={category}
          onChange={(event) => setCategory(event.target.value as DocCategory)}
        >
          {DOC_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-date">Issue / period date</Label>
        <Input
          id="doc-date"
          type="date"
          className="h-10"
          value={issuedOn}
          aria-invalid={Boolean(errors.issuedOn)}
          onValueChange={setIssuedOn}
        />
        {errors.issuedOn ? (
          <p className="text-xs text-destructive">{errors.issuedOn}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-notes">Note</Label>
        <Textarea
          id="doc-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doc-file">File (optional)</Label>
        <Input
          id="doc-file"
          type="file"
          className="h-10 py-1.5"
          onChange={(event) => void onFile(event.target.files)}
        />
        {errors.file ? <p className="text-xs text-destructive">{errors.file}</p> : null}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        Save to vault
      </Button>
    </form>
  );
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
