import { AccessCta } from "@/components/landing/access-cta";
import { Benefits } from "@/components/landing/benefits";
import { SiteFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Introduction } from "@/components/landing/introduction";
import { Services } from "@/components/landing/services";
import { SiteHeader } from "@/components/landing/site-header";
import { Trust } from "@/components/landing/trust";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Introduction />
        <Services />
        <Benefits />
        <HowItWorks />
        <Trust />
        <AccessCta />
      </main>
      <SiteFooter />
    </div>
  );
}
