# KitaCuan

Mobile-first expense and income tracker for Gen-Z Indonesia, built with Astro SSR on Cloudflare Workers.

## Stack
- Astro + Cloudflare adapter
- React islands
- Tailwind CSS v4
- shadcn-style UI primitives
- Framer Motion
- Lucia session auth with a D1-backed adapter
- Cloudflare D1 + KV

## Features in this MVP
- Email/password auth
- Protected dashboard
- Starter onboarding data for accounts and Indonesian categories
- Accounts, categories, and transaction CRUD
- Monthly dashboard summary with KV cache
- Login throttling with KV

## Local setup
1. Install dependencies:

```bash
npm install
```

2. Remote Cloudflare resources are already wired in [wrangler.jsonc](/d:/Laravel/expense-tracker/wrangler.jsonc):
- `DB`: `expense-tracker-db`
- `APP_KV`: `expense-tracker-app-kv`
- `SESSION`: `expense-tracker-session-kv`

3. Apply local migrations:

```bash
npm run db:migrate:local
```

4. Seed isolated local demo data when needed:

```bash
npm run db:seed:local
```

Demo account:
- Email: `demo@kitacuan.app`
- Password: `demo12345`

5. Apply remote migrations before the first deploy:

```bash
npm run db:migrate:remote
```

6. Regenerate Cloudflare types whenever bindings change:

```bash
npm run cf-typegen
```

7. Run the app:

```bash
npm run dev
```

## Useful commands
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run preview`
- `npm run deploy`

## Notes
- D1 is the source of truth.
- `APP_KV` is used for dashboard cache and login throttling.
- `SESSION` is reserved for Astro Cloudflare session support required by the adapter runtime.
- Local D1 seeding only targets Wrangler's `--local` database, so demo data stays isolated from production.
- Password reset, email verification, recurring transactions, and budgets are intentionally out of MVP scope.
