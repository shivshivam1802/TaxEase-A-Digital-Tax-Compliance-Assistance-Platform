import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { TdsHome } from "@/components/tds/tds-home";

export const metadata: Metadata = {
  title: "TDS",
  description: "FY 2026–27 TDS ledger, deposits, and quarterly return status.",
};

export default function TdsPage() {
  return (
    <RequireAuth>
      <TdsHome />
    </RequireAuth>
  );
}
