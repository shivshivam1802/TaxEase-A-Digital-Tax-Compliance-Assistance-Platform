export const site = {
  name: "TaxEase",
  tagline: "A Digital Tax Compliance Assistance Platform",
  description:
    "TaxEase is a digital tax compliance assistance platform for individuals and small businesses. Calculate income tax, track TDS, prepare ITR filings, manage documents, and stay ahead of due dates — with help from a CA when you need it.",
  url: "https://taxease.app",
  email: "hello@taxease.app",
} as const;

export const navItems = [
  { href: "/#platform", label: "Platform" },
  { href: "/#services", label: "Services" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#security", label: "Security" },
] as const;

export const services = [
  {
    id: "income-tax",
    title: "Income tax calculation",
    description:
      "Work out estimated tax from salary, business, and freelance income, with deductions applied using published Indian tax rules — not guesswork.",
    icon: "calculator",
  },
  {
    id: "itr",
    title: "ITR filing assistance",
    description:
      "A guided workflow that collects income, deductions, and documents so you can file with a clear summary of what is ready and what is still missing.",
    icon: "file-check",
  },
  {
    id: "tds",
    title: "TDS calculation and tracking",
    description:
      "Record TDS deducted and TDS received, reconcile against expected liability, and keep a running ledger you can actually audit.",
    icon: "receipt",
  },
  {
    id: "reminders",
    title: "Due-date reminders",
    description:
      "Advance tax, ITR, and TDS dates live on one calendar, with personal reminders so a deadline never depends on memory.",
    icon: "calendar",
  },
  {
    id: "documents",
    title: "Tax document management",
    description:
      "Store Form 16, 26AS, invoices, and proofs in one vault. Search, filter, and download when it is time to file or respond to a notice.",
    icon: "folder",
  },
  {
    id: "consultation",
    title: "CA and tax professional help",
    description:
      "Browse verified professionals, request a consultation, and track appointment status without leaving the platform.",
    icon: "users",
  },
] as const;

export const benefits = [
  {
    title: "Rules, not random numbers",
    description:
      "Tax estimates are driven by a versioned rules configuration — slabs, cess, and deductions — so the same inputs always produce the same, explainable result.",
  },
  {
    title: "Built for two kinds of filers",
    description:
      "Individuals and small businesses follow the same product, with the right income types, forms, and deadlines for each — without enterprise clutter.",
  },
  {
    title: "One trail from income to filing",
    description:
      "Calculator, TDS, documents, and ITR assistance share the same structured records. Nothing is re-typed, and nothing is left in a spreadsheet.",
  },
  {
    title: "Deadlines you can trust",
    description:
      "Statutory dates sit next to your personal reminders. You see what is due, what is done, and what still needs a document or a signature.",
  },
  {
    title: "A professional when it matters",
    description:
      "Self-serve for routine years. When a notice, capital gain, or partnership return needs a human, book a CA without switching tools.",
  },
  {
    title: "Calm, bank-grade presentation",
    description:
      "Clear language, accessible forms, and a workspace that treats tax as a serious financial process — not a marketing funnel.",
  },
] as const;

export const steps = [
  {
    step: "01",
    title: "Tell us who you are",
    description:
      "Create a profile as an individual or a small business. TaxEase uses that to show the right income types, deductions, and filing path.",
  },
  {
    step: "02",
    title: "Bring income and TDS together",
    description:
      "Enter salary, business, or freelance income. Log TDS deducted and received. The estimate updates from the same rules engine every time.",
  },
  {
    step: "03",
    title: "File with a complete picture",
    description:
      "Review the tax summary, attach required documents, and walk through ITR assistance. Alerts flag gaps before you submit.",
  },
  {
    step: "04",
    title: "Stay current all year",
    description:
      "Reminders, a document vault, and optional CA consultations keep compliance going after the return is filed — not only in July.",
  },
] as const;

export const trustPoints = [
  {
    title: "Encryption in transit and at rest",
    description:
      "Session traffic uses HTTPS. Stored records are encrypted so salary slips, PANs, and filings are not sitting in plaintext.",
    icon: "lock",
  },
  {
    title: "Least data, clear purpose",
    description:
      "We collect only what a calculation, filing, or consultation needs. You can export or delete your account data from settings.",
    icon: "eye",
  },
  {
    title: "Explainable tax math",
    description:
      "Every estimate shows the slab, rebate, surcharge, and cess applied. If a number looks wrong, you can trace it — we do not hide the working.",
    icon: "scale",
  },
  {
    title: "Access you control",
    description:
      "A CA sees your file only after you request a consultation. Revoke access when the engagement ends.",
    icon: "shield",
  },
] as const;
