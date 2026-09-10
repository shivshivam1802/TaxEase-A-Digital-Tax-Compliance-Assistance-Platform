# TaxEase

**TaxEase – A Digital Tax Compliance Assistance Platform** for individuals and small businesses in India.

This repository ships the first product slice: landing, authentication, dashboard, tax calculator, TDS ledger, ITR assistant, document vault, compliance calendar, CA desk, and settings.

## What is live

- Marketing landing page
- Sign up, sign in, forgot password, reset password (Individual or Small business)
- Signed-in dashboard for FY 2026–27:
  - Tax overview and estimated tax from a versioned new-regime rules file
  - TDS summary
  - ITR status linked to the filing assistant
  - Upcoming statutory dates
  - Recent documents from the vault
- Tax calculator: new vs old regime, s.87A, surcharge, 4% cess, old-regime 80C / 80D / HRA / housing-loan
- TDS ledger: credit vs tax you deducted, section codes, deposits, quarterly 26Q / 24Q
- ITR assistant: form recommendation (ITR-1/2/3/4), document checklist, bank details, local filing pack (not a CPC submission)
- Document vault: categorise, search, attach files up to 750 KB, download
- Calendar: advance tax, ITR, and TDS dates, plus personal reminders
- CA desk: request a consultation, share/revoke this year’s file, track status
- Settings: profile (PAN / mobile), password, JSON export, delete account

Tax and account data stays in this browser (`niyam.users.v1`, `niyam.session.v1`, `niyam.tax.v1`).

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
