import type { Metadata } from "next";

import { RequireAuth } from "@/components/auth/auth-gates";
import { CalendarHome } from "@/components/calendar/calendar-home";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Advance tax, ITR, and TDS dates plus personal reminders.",
};

export default function CalendarPage() {
  return (
    <RequireAuth>
      <CalendarHome />
    </RequireAuth>
  );
}
