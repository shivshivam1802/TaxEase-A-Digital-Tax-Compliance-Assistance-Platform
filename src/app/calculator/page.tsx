import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { CalculatorHome } from "@/components/calculator/calculator-home";

export const metadata: Metadata = {
  title: "Calculator",
  description: "Compare new and old regime income tax for FY 2026–27.",
};

export default function CalculatorPage() {
  return (
    <RequireAuth>
      <CalculatorHome />
    </RequireAuth>
  );
}
