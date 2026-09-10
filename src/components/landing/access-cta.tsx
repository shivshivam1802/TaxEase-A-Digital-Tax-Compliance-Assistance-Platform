import { WaitlistForm } from "@/components/landing/waitlist-form";

export function AccessCta() {
  return (
    <section
      id="access"
      aria-labelledby="access-heading"
      className="scroll-mt-24 border-b border-border/70 bg-card/50"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            Early access
          </p>
          <h2
            id="access-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            Be first when the workspace opens.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Niyam is being built module by module — landing page first, then
            accounts, then the tax tools. Leave your details if you want a note
            when sign-up is live.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-foreground">
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Individual and small-business paths from day one
            </li>
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Income tax, TDS, ITR, documents, calendar, and CA desk on the
              roadmap
            </li>
            <li className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              No spam, no paid ads sold from this list
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
          <h3 className="font-heading text-xl font-medium text-foreground">
            Request access
          </h3>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Takes under a minute. We only ask what we need to place you in the
            right queue.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
