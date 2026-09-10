import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { DocumentsHome } from "@/components/documents/documents-home";

export const metadata: Metadata = {
  title: "Documents",
  description: "Store Form 16, 26AS, invoices, and proofs for FY 2026–27.",
};

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <DocumentsHome />
    </RequireAuth>
  );
}
