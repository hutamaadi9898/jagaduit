import { generateId } from "lucia";

import type { DbClient } from "@/server/db/client";
import { mapCategory, now } from "@/server/db/helpers";
import type { CategoryKind } from "@/types/app";

export async function listCategories(
  db: DbClient,
  userId: string,
  includeArchived = true
) {
  const query = includeArchived
    ? "SELECT * FROM categories WHERE user_id = ? ORDER BY kind ASC, is_archived ASC, name ASC"
    : "SELECT * FROM categories WHERE user_id = ? AND is_archived = 0 ORDER BY kind ASC, name ASC";

  const { results } = await db.prepare(query).bind(userId).all<Record<string, unknown>>();
  return results.map(mapCategory);
}

export async function getCategoryById(db: DbClient, userId: string, categoryId: string) {
  const row = await db
    .prepare("SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1")
    .bind(categoryId, userId)
    .first<Record<string, unknown>>();

  return row ? mapCategory(row) : null;
}

export async function findCategoryByName(
  db: DbClient,
  userId: string,
  kind: CategoryKind,
  name: string,
  excludeCategoryId?: string
) {
  const row = await db
    .prepare(
      `
      SELECT *
      FROM categories
      WHERE user_id = ?
        AND kind = ?
        AND lower(name) = lower(?)
        AND (? IS NULL OR id != ?)
      LIMIT 1
    `
    )
    .bind(userId, kind, name.trim(), excludeCategoryId ?? null, excludeCategoryId ?? null)
    .first<Record<string, unknown>>();

  return row ? mapCategory(row) : null;
}

export async function createCategory(
  db: DbClient,
  userId: string,
  input: {
    name: string;
    kind: CategoryKind;
    icon: string;
    color: string;
    isSystem?: boolean;
  }
) {
  const timestamp = now();
  const id = generateId(18);

  await db
    .prepare(
      `
      INSERT INTO categories (
        id, user_id, name, kind, icon, color, is_system, is_archived, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `
    )
    .bind(
      id,
      userId,
      input.name,
      input.kind,
      input.icon,
      input.color,
      input.isSystem ? 1 : 0,
      timestamp,
      timestamp
    )
    .run();

  return getCategoryById(db, userId, id);
}

export async function updateCategory(
  db: DbClient,
  userId: string,
  categoryId: string,
  input: {
    name?: string;
    icon?: string;
    color?: string;
  }
) {
  const current = await getCategoryById(db, userId, categoryId);

  if (!current) {
    return null;
  }

  const timestamp = now();

  await db
    .prepare(
      `
      UPDATE categories
      SET name = ?, icon = ?, color = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(
      input.name ?? current.name,
      input.icon ?? current.icon,
      input.color ?? current.color,
      timestamp,
      categoryId,
      userId
    )
    .run();

  return getCategoryById(db, userId, categoryId);
}

export async function archiveCategory(db: DbClient, userId: string, categoryId: string) {
  const current = await getCategoryById(db, userId, categoryId);

  if (!current) {
    return { status: "missing" as const };
  }

  const activeKind = (await listCategories(db, userId, false)).filter(
    (category) => category.kind === current.kind
  );

  if (activeKind.length <= 1) {
    return { status: "blocked" as const };
  }

  if (current.isSystem) {
    return { status: "system" as const };
  }

  await db
    .prepare(
      `
      UPDATE categories
      SET is_archived = 1, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(now(), categoryId, userId)
    .run();

  return { status: "archived" as const };
}
