import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { ItrHome } from "@/components/itr/itr-home";

export const metadata: Metadata = {
  title: "ITR",
  description: "Prepare an AY 2027–28 ITR pack from your TaxEase income and TDS.",
};

export default function ItrPage() {
  return (
    <RequireAuth>
      <ItrHome />
    </RequireAuth>
  );
}
