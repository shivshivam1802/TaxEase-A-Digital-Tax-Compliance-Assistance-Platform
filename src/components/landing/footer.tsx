import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { navItems, site } from "@/lib/site";

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[oklch(0.22_0.03_160)] text-[oklch(0.93_0.02_95)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Logo
            className="text-[oklch(0.96_0.01_95)] [&_span:last-child]:text-[oklch(0.96_0.01_95)]"
            markClassName="bg-[oklch(0.86_0.08_85)] text-[oklch(0.22_0.03_160)]"
          />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            {site.tagline} Income tax, ITR, TDS, documents, and due dates for
            people who would rather not live in a folder named “FY final FINAL”.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-white/50 uppercase">
            On this page
          </p>
          <ul className="mt-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#access"
                className="text-sm text-white/75 transition-colors hover:text-white"
              >
                Request access
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-white/50 uppercase">
            Contact
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-white/75 transition-colors hover:text-white"
              >
                {site.email}
              </a>
            </li>
            {legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Niyam. All rights reserved.</p>
          <p>Not a substitute for a Chartered Accountant on contested matters.</p>
        </div>
      </div>
    </footer>
  );
}
