# Niyam

Niyam is a tax compliance platform for individuals and small businesses in India. It is being built **one module at a time**.

This repository currently ships Steps 1–3: landing page, authentication, and the user dashboard.

## What is live

- Marketing landing page
- Sign up, sign in, forgot password, reset password (Individual or Small business)
- Signed-in dashboard for FY 2026–27:
  - Tax overview and estimated tax from a versioned new-regime rules file
  - TDS summary (add / delete lines)
  - ITR status
  - Statutory deadlines
  - Empty document vault (upload ships later)
  - Quick actions that open real forms

The full calculator, TDS module, ITR assistant, document vault, calendar, CA desk, and settings are **not** built yet.

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
```
