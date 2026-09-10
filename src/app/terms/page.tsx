import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for the ${site.name} landing page and upcoming product.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="10 September 2026">
      <p>
        By using this site you agree that {site.name} is a software tool, not a
        law firm or a Chartered Accountant. Tax estimates are only as good as
        the facts you enter and the published rules we encode.
      </p>
      <h2>Early access</h2>
      <p>
        Requesting access does not create an account, a filing engagement, or a
        guarantee of capacity. We may open the product in stages (individuals
        first, then businesses) as modules ship.
      </p>
      <h2>No professional advice</h2>
      <p>
        Calculations, checklists, and reminders are assistance — not a signed
        opinion. Notices, litigation, transfer pricing, and contested assessments
        still need a qualified professional. You remain responsible for what is
        filed with the Income Tax Department.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use {site.name} to file for someone else without authority, to
        store stolen credentials, or to attempt to bypass access controls. We
        may refuse service where use would break Indian tax or data law.
      </p>
      <h2>Contact</h2>
      <p>
        Questions:{" "}
        <a className="text-foreground underline underline-offset-3" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
    </LegalPage>
  );
}
