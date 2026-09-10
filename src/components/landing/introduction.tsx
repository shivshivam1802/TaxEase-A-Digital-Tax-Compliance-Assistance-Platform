import { site } from "@/lib/site";

export function Introduction() {
  return (
    <section
      id="platform"
      aria-labelledby="platform-heading"
      className="scroll-mt-24 border-b border-border/70"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            The platform
          </p>
          <h2
            id="platform-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            A single system of record for the Indian tax year.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-7 text-muted-foreground sm:text-[1.05rem] sm:leading-8">
          <p>
            Most people still assemble a return from email attachments, Form
            16 PDFs, and a spreadsheet that was last touched in March. {site.name}{" "}
            replaces that pile with structured records: income, TDS, deductions,
            documents, and deadlines that stay in sync.
          </p>
          <p>
            The product is built for salaried individuals, freelancers, and
            small businesses who want accurate estimates, a filing path they can
            finish, and a professional on call — without switching between five
            tools.
          </p>
        </div>
      </div>
    </section>
  );
}
