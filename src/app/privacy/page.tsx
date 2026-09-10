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
        current landing page collects and how later modules are intended to
        treat tax data.
      </p>
      <h2>Early access requests</h2>
      <p>
        The request-access form stores your name, email, and filer type
        (individual or small business) in this browser&apos;s local storage
        under the key <code>niyam.waitlist.v1</code>. That data does not leave
        your device until a server is connected. Clearing site data removes it.
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
