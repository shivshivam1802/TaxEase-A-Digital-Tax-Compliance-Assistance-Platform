import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_DOC_BYTES,
  searchDocuments,
  validateDocumentInput,
  type VaultDocument,
} from "./documents";

test("document requires a name, type, and date", () => {
  const result = validateDocumentInput({
    name: "",
    category: "form16",
    issuedOn: "",
  });
  assert.equal(result.ok, false);
});

test("oversized attachments are rejected", () => {
  const result = validateDocumentInput({
    name: "Form 16",
    category: "form16",
    issuedOn: "2026-06-01",
    size: MAX_DOC_BYTES + 1,
    dataUrl: "data:application/pdf;base64,AAA",
  });
  assert.equal(result.ok, false);
});

test("search filters by query and category", () => {
  const docs: VaultDocument[] = [
    {
      id: "1",
      name: "HDFC Form 16",
      category: "form16",
      issuedOn: "2026-06-01",
      notes: "Salary",
      mime: "application/pdf",
      size: 12,
      dataUrl: null,
      createdAt: "",
    },
    {
      id: "2",
      name: "26AS FY26",
      category: "form26as",
      issuedOn: "2026-07-01",
      notes: "",
      mime: "application/pdf",
      size: 8,
      dataUrl: null,
      createdAt: "",
    },
  ];
  assert.equal(searchDocuments(docs, "hdfc", "all").length, 1);
  assert.equal(searchDocuments(docs, "", "form26as").length, 1);
});
