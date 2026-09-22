# Airdox

Monorepo for Airdox — a crypto airdrop discovery and tracking product.

- [`dashboard-app/`](dashboard-app) — the React frontend: public marketing site (previously
  hosted separately on Framer, now built natively here) plus the authenticated user
  dashboard.
- [`server/`](server) — the Express + MongoDB API: auth, subscriptions, deposits/withdrawals,
  Paystack payments, and airdrop data.

Previously these lived in two separate repositories (`Airdrop-Checker` and `Server`) and
were wired together only via a deployed API URL. They're merged here so the whole product
is one codebase.

## Getting started

Each app has its own `package.json`, `.env.example`, and README with setup details:

```bash
# frontend
cd dashboard-app && npm install && npm run dev

# backend
cd server && npm install && npm run dev
```

## A note on history

The `server/` code was brought in from the old `Server` repo without its git history. That
repo had a live `.env` file committed (database credentials, JWT secret, Paystack key, email
password), so importing its full history would have carried those secrets into this repo
too. See [`server/README.md`](server/README.md) for what was found and fixed, and what still
needs to be rotated.
