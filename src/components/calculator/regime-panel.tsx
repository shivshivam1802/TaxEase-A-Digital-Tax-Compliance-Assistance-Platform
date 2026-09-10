import { Badge } from "@/components/ui/badge";
import { formatINR, formatPercent, formatSlabRange } from "@/lib/money";
import type { RegimeId } from "@/lib/tax-rules";
import type { TaxComputation } from "@/lib/tax-engine";
import { cn } from "@/lib/utils";

export function RegimePanel({
  title,
  computation,
  highlighted,
  badge,
}: {
  title: string;
  computation: TaxComputation;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-5",
        highlighted ? "border-primary ring-3 ring-ring/30" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-medium">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Taxable {formatINR(computation.taxableIncome)}
          </p>
        </div>
        {badge ? <Badge>{badge}</Badge> : null}
      </div>
      <p className="mt-4 font-heading text-3xl tracking-tight">
        {formatINR(computation.totalTax)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Total tax including cess</p>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Gross income" value={formatINR(computation.grossIncome)} />
        {computation.deductionLines.map((line) => (
          <Row key={line.label} label={line.label} value={formatINR(line.amount)} />
        ))}
        <Row label="Slab tax" value={formatINR(computation.slabTax)} />
        <Row label="s.87A rebate" value={formatINR(computation.rebate87A)} />
        {computation.surcharge > 0 ? (
          <Row
            label={`Surcharge ${formatPercent(computation.surchargeRate)}`}
            value={formatINR(computation.surcharge)}
          />
        ) : null}
        <Row label="Cess 4%" value={formatINR(computation.cess)} />
        <Row label="Total" value={formatINR(computation.totalTax)} strong />
      </dl>

      <h4 className="mt-5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Slabs applied
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm">
        {computation.slabs.map((slab) => (
          <li key={`${slab.from}-${slab.to}`} className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {formatSlabRange(slab.from, slab.to)} · {formatPercent(slab.rate)}
            </span>
            <span>{formatINR(slab.tax)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function regimeLabel(regime: RegimeId) {
  return regime === "new" ? "New regime" : "Old regime";
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-3", strong && "pt-2 font-medium")}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
