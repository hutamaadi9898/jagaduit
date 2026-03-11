# Expense Tracker Roadmap for Gen-Z Indonesia

## Summary
- Product goal: a mobile-first web app to track income and expenses for Gen-Z users in Indonesia, with a clean UI, fast interactions, and simple daily logging.
- Current repo state: minimal Astro starter with Cloudflare adapter already installed; no Tailwind v4, React, shadcn/ui, Motion, Lucia auth, D1 schema, or KV usage yet.
- MVP completion line: finish through **Phase 13** before expanding scope.
- Product defaults locked for this plan: **Bahasa Indonesia first**, **email + password auth**, **solo/personal finance only**, **IDR only in MVP**, **timezone default `Asia/Jakarta`**, **mobile-first layout**.
- Technical direction: Astro SSR on Cloudflare Workers, React islands only where needed for shadcn/ui and Motion, Tailwind CSS v4, Lucia-style session auth with secure cookies, D1 as source of truth, KV only for cache/rate-limit/ephemeral state.

## Important Public APIs, Interfaces, and Types
- Planned routes: `/`, `/login`, `/register`, `/logout`, `/app`, `/app/transactions`, `/app/transactions/new`, `/app/accounts`, `/app/categories`, `/app/settings`.
- Planned JSON/API endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/dashboard/summary?month=YYYY-MM`, `GET /api/transactions`, `POST /api/transactions`, `PATCH /api/transactions/:id`, `DELETE /api/transactions/:id`, `GET /api/accounts`, `POST /api/accounts`, `PATCH /api/accounts/:id`, `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`.
- Cloudflare bindings: `DB` for D1, `APP_KV` for KV, existing `ASSETS` remains.
- Astro request context: `locals.user`, `locals.session`, `locals.isAuthenticated`.
- Core types:
- `User = { id, email, displayName, locale, currency, timezone, createdAt, updatedAt }`
- `Session = { id, userId, expiresAt | createdAt, cookieTokenMetadata }`
- `Account = { id, userId, name, type, color, isDefault, isArchived, createdAt, updatedAt }`
- `Category = { id, userId, name, kind, icon, color, isSystem, isArchived, createdAt, updatedAt }`
- `Transaction = { id, userId, accountId, categoryId, kind, amountMinor, note, transactionDate, createdAt, updatedAt }`
- `DashboardSummary = { month, totalIncome, totalExpense, netBalance, topCategories, dailySeries }`

## Planned Data Model
- `users`
- `id TEXT PRIMARY KEY`
- `email TEXT UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `display_name TEXT NOT NULL`
- `locale TEXT NOT NULL DEFAULT 'id-ID'`
- `currency TEXT NOT NULL DEFAULT 'IDR'`
- `timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta'`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `sessions`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `secret_hash BLOB | TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `expires_at INTEGER NULL`
- `accounts`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `type TEXT NOT NULL CHECK(type IN ('cash','bank','ewallet'))`
- `color TEXT NOT NULL`
- `is_default INTEGER NOT NULL DEFAULT 0`
- `is_archived INTEGER NOT NULL DEFAULT 0`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `categories`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `kind TEXT NOT NULL CHECK(kind IN ('income','expense'))`
- `icon TEXT NOT NULL`
- `color TEXT NOT NULL`
- `is_system INTEGER NOT NULL DEFAULT 0`
- `is_archived INTEGER NOT NULL DEFAULT 0`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `transactions`
- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `account_id TEXT NOT NULL`
- `category_id TEXT NOT NULL`
- `kind TEXT NOT NULL CHECK(kind IN ('income','expense'))`
- `amount_minor INTEGER NOT NULL`
- `note TEXT NULL`
- `transaction_date TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`

## Data and Product Rules
- Store money as integer Rupiah in `amount_minor`; no floating point.
- D1 is the only source of truth for user, auth, accounts, categories, and transactions.
- KV is only for login throttling, cached monthly dashboard summaries, and future ephemeral UX state.
- Accounts and categories are archived instead of hard-deleted once referenced by transactions.
- Seed Indonesian starter categories during onboarding.
- No shared wallets, no multi-currency, no OCR, no recurring transactions in MVP.
- Use React islands only for interactive UI blocks; prefer Astro pages and server-rendered shells elsewhere.
- Use lightweight custom charts with HTML/SVG + Motion in MVP; do not add a heavy charting library.

## Phases

### Phase 0 — Product Framing and Repo Baseline
- [x] Confirm the app name, one-sentence value proposition, and brand tone for Indonesian Gen-Z.
- [x] Replace the starter homepage direction with a clear product shell plan.
- [x] Define success metrics for MVP: daily logging speed, retention signals, and error-free transaction creation.
- [x] Document the MVP scope boundary in `plan.md` so future features do not leak into early phases.

### Phase 1 — Runtime and Tooling Foundation
- [x] Add Astro server output configuration for authenticated SSR routes on Workers.
- [x] Add React integration because shadcn/ui and Motion require React components.
- [x] Add Tailwind CSS v4 via the Astro-supported Vite plugin.
- [x] Add path aliases for `@/*` and standardize project directories for `components`, `layouts`, `lib`, `server`, and `styles`.
- [x] Add baseline scripts for local dev, build, preview, type-check, and test.

### Phase 2 — Design System and Visual Direction
- [x] Define a mobile-first visual system tuned for Gen-Z Indonesia: energetic but not childish.
- [x] Establish color tokens, spacing scale, radius scale, shadows, and typography tokens.
- [x] Initialize shadcn/ui for Astro and install only the first essential primitives.
- [x] Create app shell primitives: button, input, card, sheet, dialog, toast, badge, tabs, dropdown.
- [x] Create Motion utility wrappers for page entry, list stagger, card hover, and bottom-sheet transitions.

### Phase 3 — Cloudflare Data Foundation
- [x] Add D1 binding `DB` to Wrangler config for local and production environments.
- [x] Add KV binding `APP_KV` to Wrangler config for local and production environments.
- [x] Create a `/migrations` strategy and the first SQL migration flow for D1.
- [x] Define local seed data strategy for demo users, starter accounts, and starter categories.
- [x] Document how local D1 and KV are populated without touching production data.

### Phase 4 — Auth Schema and Session Core
- [x] Create `users` and `sessions` tables in D1.
- [x] Implement Lucia-based auth utilities for user lookup, session creation, session validation, and session invalidation.
- [x] Use `HttpOnly`, `Secure`, `SameSite=Lax` session cookies.
- [x] Add Astro middleware to resolve session state into `locals`.
- [x] Add auth guard helpers for public-only and authenticated-only routes.

### Phase 5 — Registration, Login, and Logout
- [x] Build `/register` and `/login` pages with Bahasa Indonesia copy and mobile-friendly forms.
- [x] Add secure password validation and friendly form-level error states.
- [x] Implement `POST /api/auth/register`, `POST /api/auth/login`, and `POST /api/auth/logout`.
- [x] Add login throttling backed by KV to slow repeated failed attempts.
- [x] Redirect authenticated users away from auth pages into `/app`.

### Phase 6 — Protected App Shell and Onboarding
- [x] Build the authenticated shell with top summary area and bottom navigation.
- [x] Add a first-run onboarding flow for display name, first wallet/account, and preferred starter categories.
- [x] Seed default Indonesian categories such as makan, transport, jajan, tagihan, gaji, freelance, hadiah, and top up.
- [x] Add empty states for users with zero transactions.
- [x] Ensure every authenticated route works on narrow mobile screens first.

### Phase 7 — Accounts and Wallets
- [x] Build `/app/accounts` with create, edit, archive, and set-default actions.
- [x] Support account types `cash`, `bank`, and `ewallet`.
- [x] Add account color selection for quick visual recognition.
- [x] Prevent archiving the last active account.
- [x] Require an active default account before transaction creation.

### Phase 8 — Categories
- [x] Build `/app/categories` with separate income and expense sections.
- [x] Allow users to create custom categories with icon and color selection.
- [x] Prevent duplicate category names per kind for the same user.
- [x] Allow archive but block archive if it would break the last usable category for a kind.
- [x] Preserve seeded categories as editable-but-not-removable defaults.

### Phase 9 — Income Transaction Flow
- [x] Build income creation with amount, date, account, category, and note.
- [x] Add quick amount entry optimized for phone keyboards.
- [x] Add edit and delete for income transactions.
- [x] Validate account ownership, category ownership, and positive integer amount.
- [x] Invalidate and refresh cached monthly summaries after any income mutation.

### Phase 10 — Expense Transaction Flow
- [x] Build expense creation with the same structure as income for consistency.
- [x] Optimize the form for fast repeat logging with recent field defaults.
- [x] Add edit and delete for expense transactions.
- [x] Add clear error states for invalid or archived account/category references.
- [x] Invalidate and refresh cached monthly summaries after any expense mutation.

### Phase 11 — Transaction History and Filters
- [x] Build `/app/transactions` with reverse-chronological listing.
- [x] Add filters for month, type, account, and category.
- [x] Add search by note text.
- [x] Group results by date for easier scanning.
- [x] Preserve filter state in the URL for shareable/debuggable views.

### Phase 12 — Dashboard and Monthly Insight
- [x] Build `/app` dashboard with total income, total expense, and net balance for the active month.
- [x] Show top expense categories for the month.
- [x] Show a simple daily spending trend for the selected month.
- [x] Cache month summary payloads in KV and invalidate them on transaction mutations.
- [x] Add friendly empty states and “start logging” prompts for new users.

### Phase 13 — MVP Hardening and Deployment
- [x] Add loading, disabled, success, and error states across all forms and destructive actions.
- [x] Add route-level error handling and fallback UI for D1/KV failures.
- [x] Add basic analytics/logging for auth errors and failed transaction writes.
- [x] Add SEO metadata, social metadata, and app manifest placeholders.
- [x] Finalize Cloudflare Worker deployment flow, environment setup, and rollback notes.
- [ ] Freeze scope and tag this point as **MVP release candidate**.

### Phase 14 — PWA and Re-Engagement
- [ ] Add installable PWA metadata and icons.
- [ ] Add offline-friendly read access for the last loaded dashboard and history screen.
- [ ] Add lightweight reminder notifications strategy for daily expense logging.
- [ ] Add “continue where you left off” state for incomplete transaction drafts.

### Phase 15 — Budgets and Spending Limits
- [ ] Add monthly budget targets per category and optional overall monthly cap.
- [ ] Show spent vs remaining progress on dashboard and category views.
- [ ] Add warning states when users approach or pass limits.
- [ ] Add month rollover logic for budget reset.

### Phase 16 — Recurring Transactions and Reminders
- [ ] Add recurring income and recurring expense templates.
- [ ] Add schedule rules for weekly, monthly, and custom intervals.
- [ ] Add reminder surfaces before due dates.
- [ ] Add bulk-apply flow to generate current-month records from templates.

### Phase 17 — Savings Goals and Gamified Progress
- [ ] Add savings goals with target amount and target date.
- [ ] Add progress cards, milestones, and celebratory Motion states.
- [ ] Add challenge-style nudges suitable for Gen-Z without making finance tracking feel childish.
- [ ] Tie surplus monthly balance into suggested goal contributions.

### Phase 18 — Bills, Debt, and Installments
- [ ] Add recurring bill tracking separate from normal spending.
- [ ] Add debt and installment entries with remaining balance tracking.
- [ ] Add due-date urgency states and missed-payment visibility.
- [ ] Add reporting that separates discretionary spending from obligations.

### Phase 19 — Receipt Capture and Merchant Memory
- [ ] Add receipt image upload planning and OCR pipeline preparation.
- [ ] Add merchant memory for repeated stores and cafes.
- [ ] Add suggested category/account values from prior behavior.
- [ ] Keep OCR as assistive only; user confirmation remains mandatory.

### Phase 20 — Shared Wallets and Social/Household Features
- [ ] Add optional shared wallet model for couples, roommates, or family.
- [ ] Add invitations, role permissions, and activity history.
- [ ] Add split expense entries and settle-up flows.
- [ ] Keep solo mode as the default even after shared features launch.

### Phase 21 — Smart Insights and Expansion
- [ ] Add monthly behavioral insights such as spending spikes, streaks, and category drift.
- [ ] Add personalized prompts in Bahasa Indonesia based on real transaction patterns.
- [ ] Add bilingual support if product traction expands beyond Indonesia-first users.
- [ ] Re-evaluate whether the project should stay Astro-only or evolve into a more app-heavy client architecture.

## Test Cases and Scenarios
- [x] Unauthenticated users trying to access `/app` are redirected to `/login`.
- [x] Authenticated users trying to open `/login` or `/register` are redirected to `/app`.
- [x] Registration fails cleanly for duplicate email and weak password.
- [x] Login throttling triggers after repeated invalid attempts and resets correctly later.
- [x] Logout invalidates the server session and removes the cookie.
- [x] A user cannot read or mutate another user’s accounts, categories, or transactions.
- [x] A transaction cannot be created with archived or foreign account/category IDs.
- [x] Dashboard totals equal the sum of monthly transactions in D1.
- [x] KV-cached dashboard summaries are invalidated after create, update, and delete transaction actions.
- [x] Month filters and URL query parameters produce deterministic transaction lists.
- [ ] Mobile viewport interaction works for onboarding, add transaction, filters, and destructive confirmations.
- [ ] Local D1 and KV development data stay isolated from production bindings.
- [ ] Worker build, preview, and deploy all succeed with the final environment contract.

## Assumptions and Defaults
- Bahasa Indonesia UI copy is the default release language.
- IDR is the only supported currency in MVP.
- Personal finance is the only supported ownership model in MVP.
- Email verification, password reset, and OAuth are deferred until after MVP unless security/compliance needs change.
- Desktop support is good but secondary; design and QA prioritize mobile widths first.
- Raw SQL with small repository modules is preferred over introducing an ORM in MVP.
- Motion is used for meaningful transitions and delight, not for constant animation noise.
- KV must never hold data that would be costly or impossible to reconstruct from D1.

## Official References
- Astro Cloudflare adapter: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Tailwind CSS v4 with Astro: https://tailwindcss.com/docs/installation/framework-guides/astro
- shadcn/ui for Astro: https://ui.shadcn.com/docs/installation/astro
- Motion for React: https://motion.dev/docs/react
- Lucia session guidance: https://lucia-auth.com/sessions/overview
- Lucia basic session security: https://lucia-auth.com/sessions/basic
- Cloudflare D1 local development: https://developers.cloudflare.com/d1/best-practices/local-development/
- Cloudflare KV bindings: https://developers.cloudflare.com/kv/concepts/kv-bindings/
