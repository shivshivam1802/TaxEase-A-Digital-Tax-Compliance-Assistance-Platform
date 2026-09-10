import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  href?: string;
};

export function Logo({ className, markClassName, href = "/#top" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      aria-label="Niyam home"
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm",
          markClassName
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="none">
          <path
            d="M5 18V6.8c0-.7.4-1.3 1-1.6L12 3l6 2.2c.6.3 1 .9 1 1.6V18"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 13.5 11 16l4.5-5.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-xl leading-none tracking-tight text-foreground">
        Niyam
      </span>
    </Link>
  );
}
