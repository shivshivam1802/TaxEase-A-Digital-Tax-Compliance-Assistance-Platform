import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "FY 2026–27 tax overview for your Niyam account.",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardHome />
    </RequireAuth>
  );
}
