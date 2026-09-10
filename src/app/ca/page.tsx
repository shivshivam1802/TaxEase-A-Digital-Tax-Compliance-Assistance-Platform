import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { CaHome } from "@/components/ca/ca-home";

export const metadata: Metadata = {
  title: "CA desk",
  description: "Request a chartered accountant consultation and track the booking.",
};

export default function CaPage() {
  return (
    <RequireAuth>
      <CaHome />
    </RequireAuth>
  );
}
