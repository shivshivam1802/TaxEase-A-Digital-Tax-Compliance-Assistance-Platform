import type { Metadata } from "next";

import { AccountHome } from "@/components/auth/account-home";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Niyam account session.",
};

export default function AccountPage() {
  return <AccountHome />;
}
