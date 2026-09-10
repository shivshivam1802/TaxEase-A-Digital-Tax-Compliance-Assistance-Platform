import { steps } from "@/lib/site";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="scroll-mt-24 border-b border-border/70 bg-[oklch(0.27_0.035_160)] text-[oklch(0.97_0.01_95)]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-[oklch(0.86_0.08_85)] uppercase">
            How it works
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-heading text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
          >
            Four steps from first login to a year you can defend.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/70">
            No hidden “magic file” button. You enter facts, Niyam applies the
            rules, and you decide when a CA should look.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 lg:grid-cols-4">
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-[2.6rem] hidden h-px w-[calc(100%-1.2rem)] bg-white/15 lg:block"
                />
              ) : null}
              <p className="font-heading text-sm tracking-[0.2em] text-[oklch(0.86_0.08_85)]">
                {item.step}
              </p>
              <h3 className="mt-4 font-heading text-xl font-medium">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
