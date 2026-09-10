import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Niyam account has moved to Settings.",
};

export default function AccountPage() {
  redirect("/settings");
}
