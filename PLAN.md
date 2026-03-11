# Expense Tracker MVP

This repository implements the MVP path for `KitaCuan`, a mobile-first expense and income tracker for Gen-Z users in Indonesia.

## Stack
- Astro SSR on Cloudflare Workers
- React islands for interactive shadcn/ui and Motion components
- Tailwind CSS v4
- Lucia session auth with D1-backed custom adapter
- Cloudflare D1 as primary datastore
- Cloudflare KV for rate-limits and dashboard cache

## MVP Scope
- Email and password authentication
- Onboarding with starter account and Indonesian starter categories
- Dashboard, accounts, categories, and transactions
- Monthly summary with cached dashboard insight
- Mobile-first Bahasa Indonesia interface

## Success Metrics
- First transaction can be logged in under 20 seconds after entering the app.
- Returning users can reuse recent defaults to add repeat transactions with minimal taps.
- Transaction create, update, and delete flows should stay error-free in normal operation and fail with clear recovery states when D1 or KV is unavailable.

## Release Candidate
- Scope is frozen at Phase 13: no budgets, recurring transactions, shared wallets, OCR, or multi-currency work enters this branch.
- A release candidate is only valid after migrations, build, preview, deploy, and smoke checks pass against the current Cloudflare environment contract.

## Future Phases
- PWA and reminders
- Budgets
- Recurring transactions
- Savings goals
- Shared wallets
- Smart insights
