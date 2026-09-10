export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatCompactINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function parseRupees(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) {
    return null;
  }
  return Math.round(amount);
}

export function rupeesInput(value: number) {
  return value === 0 ? "" : String(value);
}
