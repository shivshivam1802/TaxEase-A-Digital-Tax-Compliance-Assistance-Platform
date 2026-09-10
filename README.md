# Niyam

Niyam is a tax compliance platform for individuals and small businesses in India. It is being built **one module at a time**.

This repository currently ships **Step 1 — the marketing landing page**.

## What is live

- Hero, platform introduction, services, benefits, how-it-works, and security sections
- Responsive header with working in-page navigation (including a mobile menu)
- Early-access form with validation, loading, success, and duplicate-email handling
- Privacy and terms pages with real copy
- Waitlist records stored in the browser (`localStorage`) so a backend can replace that later

Authentication, the dashboard, the calculator, and the other product modules are **not** built yet.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

```bash
npm run lint
npm run build
npm start
```

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Product name

**Niyam** (rule, discipline) is the working brand for a calm, professional tax-tech product — income tax, ITR assistance, TDS, documents, reminders, and CA consultation.
