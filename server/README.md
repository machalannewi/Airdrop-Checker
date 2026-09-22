# Airdox API

Express + MongoDB backend for Airdox: auth, subscriptions, deposits/withdrawals,
Paystack payments, and airdrop data.

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values — see below
npm run dev
```

`npm run dev` uses `node --watch` for auto-restart. `npm start` runs it plainly.

## Environment variables

See `.env.example` for the full list. All of `MONGO_URI` and `JWT_SECRET` are required —
the server refuses to start without them.

**If you're setting this up from the old `Server` repo:** that repo had a live `.env`
committed to git history, which means everything in it — the Mongo URI, JWT secret,
Paystack secret key, and email app password — was public. Generate fresh values for all
of them before deploying; see the security notes below.

## Security notes

This backend went through a security review when it was merged into this repo. Fixed:

- **Leaked secrets**: the source `Server` repo had `.env` and `node_modules` committed to
  git. Neither was carried over here, and `.gitignore` now excludes them. The exposed
  credentials still need to be rotated (they were public on GitHub regardless of this fix).
- **Withdrawal balance manipulation**: `/api/withdrawals/request` didn't validate that
  `amount` was positive, and used a read-then-write balance check with no locking — both a
  free-money bug and a race condition allowing double-spending. Now validated and applied
  as one atomic, conditional MongoDB update.
- **Paystack verification replay**: `/api/paystack/verify` re-extended a subscription every
  time it was called with the same (valid) reference. Now checks for an existing
  `Transaction` with that reference before crediting anything.
- **User enumeration**: login returned different errors for "no such user" vs "wrong
  password." Both now return the same generic message.
- **Error leakage**: several routes returned raw error objects (including stack traces) to
  the client. All routes now funnel errors through a central handler that logs internally
  and returns a generic message.
- **NoSQL injection surface**: admin login and other routes didn't type-validate `req.body`
  fields, so a JSON object could be passed where a string was expected. Added
  `express-validator` checks plus `express-mongo-sanitize` globally.
- **Brute force**: no rate limiting existed on login/signup. Added `express-rate-limit` on
  `/api/auth` and `/api/admin/login`.
- **Resource exhaustion**: `/api/airdrops` launched a fresh headless Chrome instance per
  request with no caching. Added a 5-minute result cache and a single-flight guard so
  concurrent requests share one scrape instead of each spawning a browser.
- **Missing security headers / body limits**: added `helmet()` and a JSON body size limit.
- **Dependency CVEs**: `nodemailer`, `node-cron`, and `puppeteer` were pinned to versions
  with known high/moderate-severity advisories; upgraded to patched majors (`npm audit`
  now reports 0 vulnerabilities).
- Fixed a handful of real bugs found along the way: an undefined-variable reference in the
  admin transaction-verification route, a crash in deposit approval when `currency` wasn't
  set, and an undefined variable in an email-sent log line.

**Known residual risk**: the Paystack verify race — two near-simultaneous requests with the
same reference could both pass the "already processed" check before either write commits.
Closing this fully needs a MongoDB transaction/session; flagged here rather than fixed, to
keep the change scoped to this review.
