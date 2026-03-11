DELETE FROM transactions;
DELETE FROM sessions;
DELETE FROM categories;
DELETE FROM accounts;
DELETE FROM users;

INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  locale,
  currency,
  timezone,
  onboarding_completed_at,
  created_at,
  updated_at
)
VALUES (
  'demo-user-000001',
  'demo@kitacuan.app',
  'a2d60d304101241dd08367022d9a0eab:d410f338ac6b8ae619a3bae49199320bfb5b3212e2d6dba09d799142864e19d3d6ac8a41e9481ec1bf848405b643891238012bb0225cb3e3028f2f90e7802a1a',
  'Naya Demo',
  'id-ID',
  'IDR',
  'Asia/Jakarta',
  CAST(unixepoch('now') * 1000 AS INTEGER),
  CAST(unixepoch('now') * 1000 AS INTEGER),
  CAST(unixepoch('now') * 1000 AS INTEGER)
);

INSERT INTO accounts (id, user_id, name, type, color, is_default, is_archived, created_at, updated_at)
VALUES
  ('demo-account-cash', 'demo-user-000001', 'Dompet Harian', 'cash', '#f97316', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-account-bank', 'demo-user-000001', 'Bank Utama', 'bank', '#0ea5e9', 0, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-account-ewallet', 'demo-user-000001', 'E-Wallet', 'ewallet', '#22c55e', 0, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER));

INSERT INTO categories (id, user_id, name, kind, icon, color, is_system, is_archived, created_at, updated_at)
VALUES
  ('demo-cat-makan', 'demo-user-000001', 'Makan', 'expense', 'UtensilsCrossed', '#f97316', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-cat-transport', 'demo-user-000001', 'Transport', 'expense', 'BusFront', '#14b8a6', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-cat-jajan', 'demo-user-000001', 'Jajan', 'expense', 'CupSoda', '#ec4899', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-cat-gaji', 'demo-user-000001', 'Gaji', 'income', 'WalletCards', '#22c55e', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-cat-freelance', 'demo-user-000001', 'Freelance', 'income', 'Laptop', '#0ea5e9', 1, 0, CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER));

INSERT INTO transactions (id, user_id, account_id, category_id, kind, amount_minor, note, transaction_date, created_at, updated_at)
VALUES
  ('demo-tx-001', 'demo-user-000001', 'demo-account-bank', 'demo-cat-gaji', 'income', 4500000, 'Gaji bulanan', date('now', '-5 day'), CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-tx-002', 'demo-user-000001', 'demo-account-cash', 'demo-cat-makan', 'expense', 28000, 'Mie ayam', date('now', '-4 day'), CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-tx-003', 'demo-user-000001', 'demo-account-ewallet', 'demo-cat-jajan', 'expense', 18000, 'Es kopi susu', date('now', '-3 day'), CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-tx-004', 'demo-user-000001', 'demo-account-cash', 'demo-cat-transport', 'expense', 12000, 'Ojek ke kampus', date('now', '-2 day'), CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER)),
  ('demo-tx-005', 'demo-user-000001', 'demo-account-bank', 'demo-cat-freelance', 'income', 850000, 'Fee desain landing page', date('now', '-1 day'), CAST(unixepoch('now') * 1000 AS INTEGER), CAST(unixepoch('now') * 1000 AS INTEGER));
