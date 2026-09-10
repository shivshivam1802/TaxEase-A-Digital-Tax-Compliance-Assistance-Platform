# Niyam

Niyam is a tax compliance platform for individuals and small businesses in India. It is being built **one module at a time**.

This repository currently ships Steps 1–5: landing page, authentication, the user dashboard, the tax calculator, and the TDS ledger.

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
- Tax calculator:
  - New vs old regime comparison with a recommendation
  - s.87A rebate, surcharge (with marginal relief), and 4% cess
  - Old-regime 80C / 80D / HRA / housing-loan interest (capped)
  - Save the snapshot back to the dashboard
- TDS ledger:
  - Credit (withheld from you) vs tax you deducted
  - Section codes, rate helper, PAN, edit / delete
  - Deposit due dates (7th of the next month; 30 April for March)
  - Quarterly 26Q / 24Q status

The ITR assistant, document vault, calendar, CA desk, and settings are **not** built yet.

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
