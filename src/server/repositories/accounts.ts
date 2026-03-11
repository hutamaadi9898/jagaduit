import { generateId } from "lucia";

import type { DbClient } from "@/server/db/client";
import { mapAccount, now } from "@/server/db/helpers";
import type { AccountType } from "@/types/app";

export async function listAccounts(db: DbClient, userId: string, includeArchived = true) {
  const query = includeArchived
    ? "SELECT * FROM accounts WHERE user_id = ? ORDER BY is_archived ASC, is_default DESC, created_at ASC"
    : "SELECT * FROM accounts WHERE user_id = ? AND is_archived = 0 ORDER BY is_default DESC, created_at ASC";

  const { results } = await db.prepare(query).bind(userId).all<Record<string, unknown>>();
  return results.map(mapAccount);
}

export async function getAccountById(db: DbClient, userId: string, accountId: string) {
  const row = await db
    .prepare("SELECT * FROM accounts WHERE id = ? AND user_id = ? LIMIT 1")
    .bind(accountId, userId)
    .first<Record<string, unknown>>();

  return row ? mapAccount(row) : null;
}

export async function getDefaultAccount(db: DbClient, userId: string) {
  const row = await db
    .prepare(
      "SELECT * FROM accounts WHERE user_id = ? AND is_default = 1 AND is_archived = 0 LIMIT 1"
    )
    .bind(userId)
    .first<Record<string, unknown>>();

  return row ? mapAccount(row) : null;
}

export async function createAccount(
  db: DbClient,
  userId: string,
  input: { name: string; type: AccountType; color: string; isDefault?: boolean }
) {
  const existing = await listAccounts(db, userId, false);
  const shouldBeDefault = input.isDefault || existing.length === 0;
  const timestamp = now();
  const id = generateId(18);

  if (shouldBeDefault) {
    await db
      .prepare("UPDATE accounts SET is_default = 0, updated_at = ? WHERE user_id = ?")
      .bind(timestamp, userId)
      .run();
  }

  await db
    .prepare(
      `
      INSERT INTO accounts (
        id, user_id, name, type, color, is_default, is_archived, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `
    )
    .bind(
      id,
      userId,
      input.name,
      input.type,
      input.color,
      shouldBeDefault ? 1 : 0,
      timestamp,
      timestamp
    )
    .run();

  return getAccountById(db, userId, id);
}

export async function updateAccount(
  db: DbClient,
  userId: string,
  accountId: string,
  input: { name?: string; type?: AccountType; color?: string; isDefault?: boolean }
) {
  const current = await getAccountById(db, userId, accountId);

  if (!current) {
    return null;
  }

  const timestamp = now();
  const next = {
    name: input.name ?? current.name,
    type: input.type ?? current.type,
    color: input.color ?? current.color,
    isDefault: input.isDefault ?? current.isDefault
  };
  const activeAccounts = await listAccounts(db, userId, false);

  if (next.isDefault) {
    await db
      .prepare("UPDATE accounts SET is_default = 0, updated_at = ? WHERE user_id = ?")
      .bind(timestamp, userId)
      .run();
  }

  await db
    .prepare(
      `
      UPDATE accounts
      SET name = ?, type = ?, color = ?, is_default = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(
      next.name,
      next.type,
      next.color,
      next.isDefault ? 1 : 0,
      timestamp,
      accountId,
      userId
    )
    .run();

  if (current.isDefault && !next.isDefault) {
    const replacement = activeAccounts.find((account) => account.id !== accountId);
    if (replacement) {
      await db
        .prepare("UPDATE accounts SET is_default = 1, updated_at = ? WHERE id = ?")
        .bind(timestamp, replacement.id)
        .run();
    } else {
      await db
        .prepare("UPDATE accounts SET is_default = 1, updated_at = ? WHERE id = ?")
        .bind(timestamp, accountId)
        .run();
    }
  }

  return getAccountById(db, userId, accountId);
}

export async function archiveAccount(db: DbClient, userId: string, accountId: string) {
  const current = await getAccountById(db, userId, accountId);

  if (!current) {
    return { status: "missing" as const };
  }

  const active = await listAccounts(db, userId, false);

  if (active.length <= 1) {
    return { status: "blocked" as const };
  }

  const timestamp = now();

  await db
    .prepare(
      `
      UPDATE accounts
      SET is_archived = 1, is_default = 0, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(timestamp, accountId, userId)
    .run();

  if (current.isDefault) {
    const replacement = active.find((account) => account.id !== accountId);
    if (replacement) {
      await db
        .prepare("UPDATE accounts SET is_default = 1, updated_at = ? WHERE id = ?")
        .bind(timestamp, replacement.id)
        .run();
    }
  }

  return { status: "archived" as const };
}
