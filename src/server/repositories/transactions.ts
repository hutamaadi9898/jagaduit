import { generateId } from "lucia";

import { mapTransaction, now, toMonthRange } from "@/server/db/helpers";
import { getAccountById } from "@/server/repositories/accounts";
import { getCategoryById } from "@/server/repositories/categories";
import type { TransactionKind } from "@/types/app";

export type TransactionFilters = {
  month: string;
  kind?: TransactionKind | "all";
  accountId?: string;
  categoryId?: string;
  query?: string;
};

export async function listTransactions(
  db: D1Database,
  userId: string,
  filters: TransactionFilters
) {
  const bindings: Array<string | number> = [userId];
  const clauses = ["t.user_id = ?"];
  const { start, end } = toMonthRange(filters.month);

  clauses.push("t.transaction_date >= ?");
  clauses.push("t.transaction_date < ?");
  bindings.push(start, end);

  if (filters.kind && filters.kind !== "all") {
    clauses.push("t.kind = ?");
    bindings.push(filters.kind);
  }

  if (filters.accountId) {
    clauses.push("t.account_id = ?");
    bindings.push(filters.accountId);
  }

  if (filters.categoryId) {
    clauses.push("t.category_id = ?");
    bindings.push(filters.categoryId);
  }

  if (filters.query) {
    clauses.push("lower(coalesce(t.note, '')) LIKE ?");
    bindings.push(`%${filters.query.toLowerCase()}%`);
  }

  const statement = `
    SELECT
      t.*,
      a.name AS account_name,
      a.color AS account_color,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM transactions t
    INNER JOIN accounts a ON a.id = t.account_id
    INNER JOIN categories c ON c.id = t.category_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY t.transaction_date DESC, t.created_at DESC
  `;

  const { results } = await db
    .prepare(statement)
    .bind(...bindings)
    .all<Record<string, unknown>>();

  return results.map(mapTransaction);
}

export async function getTransactionById(db: D1Database, userId: string, transactionId: string) {
  const result = await db
    .prepare(
      `
      SELECT
        t.*,
        a.name AS account_name,
        a.color AS account_color,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon
      FROM transactions t
      INNER JOIN accounts a ON a.id = t.account_id
      INNER JOIN categories c ON c.id = t.category_id
      WHERE t.id = ? AND t.user_id = ?
      LIMIT 1
    `
    )
    .bind(transactionId, userId)
    .first<Record<string, unknown>>();

  return result ? mapTransaction(result) : null;
}

export async function listRecentTransactions(
  db: D1Database,
  userId: string,
  limit = 5
) {
  const { results } = await db
    .prepare(
      `
      SELECT
        t.*,
        a.name AS account_name,
        a.color AS account_color,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon
      FROM transactions t
      INNER JOIN accounts a ON a.id = t.account_id
      INNER JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `
    )
    .bind(userId, limit)
    .all<Record<string, unknown>>();

  return results.map(mapTransaction);
}

export async function createTransaction(
  db: D1Database,
  userId: string,
  input: {
    accountId: string;
    categoryId: string;
    kind: TransactionKind;
    amountMinor: number;
    note?: string | null;
    transactionDate: string;
  }
) {
  const account = await getAccountById(db, userId, input.accountId);
  const category = await getCategoryById(db, userId, input.categoryId);

  if (!account || account.isArchived) {
    return { status: "invalid-account" as const };
  }

  if (!category || category.isArchived || category.kind !== input.kind) {
    return { status: "invalid-category" as const };
  }

  const id = generateId(18);
  const timestamp = now();

  await db
    .prepare(
      `
      INSERT INTO transactions (
        id, user_id, account_id, category_id, kind, amount_minor, note, transaction_date, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      id,
      userId,
      input.accountId,
      input.categoryId,
      input.kind,
      input.amountMinor,
      input.note ?? null,
      input.transactionDate,
      timestamp,
      timestamp
    )
    .run();

  return { status: "created" as const, transaction: await getTransactionById(db, userId, id) };
}

export async function updateTransaction(
  db: D1Database,
  userId: string,
  transactionId: string,
  input: {
    accountId?: string;
    categoryId?: string;
    kind?: TransactionKind;
    amountMinor?: number;
    note?: string | null;
    transactionDate?: string;
  }
) {
  const current = await getTransactionById(db, userId, transactionId);

  if (!current) {
    return { status: "missing" as const };
  }

  const next = {
    accountId: input.accountId ?? current.accountId,
    categoryId: input.categoryId ?? current.categoryId,
    kind: input.kind ?? current.kind,
    amountMinor: input.amountMinor ?? current.amountMinor,
    note: input.note ?? current.note,
    transactionDate: input.transactionDate ?? current.transactionDate
  };

  const account = await getAccountById(db, userId, next.accountId);
  const category = await getCategoryById(db, userId, next.categoryId);

  if (!account || account.isArchived) {
    return { status: "invalid-account" as const };
  }

  if (!category || category.isArchived || category.kind !== next.kind) {
    return { status: "invalid-category" as const };
  }

  await db
    .prepare(
      `
      UPDATE transactions
      SET account_id = ?, category_id = ?, kind = ?, amount_minor = ?, note = ?, transaction_date = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(
      next.accountId,
      next.categoryId,
      next.kind,
      next.amountMinor,
      next.note ?? null,
      next.transactionDate,
      now(),
      transactionId,
      userId
    )
    .run();

  return { status: "updated" as const, transaction: await getTransactionById(db, userId, transactionId) };
}

export async function deleteTransaction(db: D1Database, userId: string, transactionId: string) {
  const current = await getTransactionById(db, userId, transactionId);

  if (!current) {
    return { status: "missing" as const };
  }

  await db
    .prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
    .bind(transactionId, userId)
    .run();

  return { status: "deleted" as const, transaction: current };
}
