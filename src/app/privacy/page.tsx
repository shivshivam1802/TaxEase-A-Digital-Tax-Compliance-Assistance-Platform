import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} handles waitlist and product data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="10 September 2026">
      <p>
        {site.name} is in early development. This notice describes what the
        current product stores in your browser and how later modules are
        intended to treat tax data.
      </p>
      <h2>Accounts</h2>
      <p>
        Sign-up stores your name, email, filer type (individual or small
        business), and a salted SHA-256 password hash in this browser under{" "}
        <code>niyam.users.v1</code>. A session pointer lives in{" "}
        <code>niyam.session.v1</code>. Passwords are never stored in plaintext.
        Clearing site data signs you out and deletes local accounts.
      </p>
      <h2>Password resets</h2>
      <p>
        Because this build has no mail server, a reset request writes a
        30-minute token next to your account and shows the link on screen. In
        production the same token would be emailed, not displayed.
      </p>
      <h2>Tax year records</h2>
      <p>
        The dashboard stores income snapshots, TDS lines, and ITR status per
        account in <code>niyam.tax.v1</code>. The calculator stores the same
        income plus old-regime deduction details in that record. Amounts never
        leave this browser until a server is connected.
      </p>
      <h2>Early access list</h2>
      <p>
        The original waitlist form, if used, stored name, email, and filer type
        under <code>niyam.waitlist.v1</code>. That data does not leave your
        device until a server is connected.
      </p>
      <h2>What we will not do</h2>
      <p>
        We will not sell waitlist or tax records. A chartered accountant will
        only see a file if you request a consultation. Product analytics, when
        added, will be aggregated and optional.
      </p>
      <h2>Intended product data</h2>
      <p>
        Future modules will store income, TDS, documents, and filing status in
        a structured store so they can move to an encrypted backend. Retention
        will follow what a return actually needs — typically the current year
        plus prior years you choose to keep.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a className="text-foreground underline underline-offset-3" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
    </LegalPage>
  );
}
