# Niyam

Niyam is a tax compliance platform for individuals and small businesses in India. It is being built **one module at a time**.

This repository currently ships **Step 1 — Landing page** and **Step 2 — Authentication**.

## What is live

- Marketing landing page (hero, services, benefits, how-it-works, security)
- Create account, sign in, forgot password, and reset password
- User type at sign-up: Individual or Small business
- Signed-in account page (session confirmation — the tax dashboard is not built yet)
- Accounts stored in the browser: salted SHA-256 password hashes in `localStorage`

The dashboard, calculator, TDS, ITR, documents, calendar, and CA modules are **not** built yet.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

```bash
npm run lint
npm test
npm run build
npm start
```

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui.
