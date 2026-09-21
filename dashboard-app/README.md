# Airdox

A React + Vite single-page app for Airdox: a public marketing site (landing page, pricing,
FAQ) plus an authenticated user dashboard for tracking and claiming crypto airdrops.

The marketing site was previously hosted separately on Framer and linked out to this
dashboard. It's now been rebuilt natively in this app (`src/Public`) so the whole product —
landing page and dashboard — is one codebase, one design system, and one deploy.

## Stack

- React 19 + React Router 7
- Tailwind CSS (custom "Airdox" theme — black/navy background, indigo-blue brand color,
  Poppins font — see `tailwind.config.js`)
- Framer Motion for scroll/entry animations
- lucide-react for icons

## Structure

```
src/
  Public/            marketing site (landing page + sections)
  User/
    components/       dashboard shell, auth pages, feature tabs
    context/           AuthContext — session state (token/user/subscribed)
  config.js           API base URL
```

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if not using the default API
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Auth

Session state (JWT, user profile, subscription flag) is centralized in
`src/User/context/AuthContext.jsx` and persisted to `localStorage`. The `/dashboard` route is
guarded by `ProtectedRoute`, which redirects unauthenticated visitors to `/login`.
