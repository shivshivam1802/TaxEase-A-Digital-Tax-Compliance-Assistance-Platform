import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { SettingsHome } from "@/components/settings/settings-home";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, password, export, and delete your TaxEase account.",
};

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsHome />
    </RequireAuth>
  );
}
