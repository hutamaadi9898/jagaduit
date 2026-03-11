import { generateId } from "lucia";

import type { DbClient } from "@/server/db/client";
import { mapUser, now } from "@/server/db/helpers";
import type { User } from "@/types/app";

export async function findUserByEmail(db: DbClient, email: string) {
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .bind(email.toLowerCase())
    .first<Record<string, unknown>>();

  return row ? mapUser(row) : null;
}

export async function findUserById(db: DbClient, userId: string) {
  const row = await db
    .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
    .bind(userId)
    .first<Record<string, unknown>>();

  return row ? mapUser(row) : null;
}

export async function createUser(
  db: DbClient,
  input: Pick<User, "email" | "displayName" | "locale" | "currency" | "timezone"> & {
    passwordHash: string;
  }
) {
  const id = generateId(18);
  const timestamp = now();

  await db
    .prepare(
      `
      INSERT INTO users (
        id, email, password_hash, display_name, locale, currency, timezone, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      id,
      input.email.toLowerCase(),
      input.passwordHash,
      input.displayName,
      input.locale,
      input.currency,
      input.timezone,
      timestamp,
      timestamp
    )
    .run();

  return {
    id,
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    locale: input.locale,
    currency: input.currency,
    timezone: input.timezone,
    onboardingCompletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp
  } satisfies User;
}

export async function getPasswordHashByEmail(db: DbClient, email: string) {
  const row = await db
    .prepare("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1")
    .bind(email.toLowerCase())
    .first<{ id: string; password_hash: string }>();

  return row ?? null;
}

export async function updateUserProfile(
  db: DbClient,
  userId: string,
  data: Partial<Pick<User, "displayName" | "timezone" | "locale">>
) {
  const current = await findUserById(db, userId);

  if (!current) {
    return null;
  }

  const updated = {
    displayName: data.displayName ?? current.displayName,
    timezone: data.timezone ?? current.timezone,
    locale: data.locale ?? current.locale
  };

  const timestamp = now();

  await db
    .prepare(
      `
      UPDATE users
      SET display_name = ?, timezone = ?, locale = ?, updated_at = ?
      WHERE id = ?
    `
    )
    .bind(updated.displayName, updated.timezone, updated.locale, timestamp, userId)
    .run();

  return findUserById(db, userId);
}

export async function completeUserOnboarding(db: DbClient, userId: string) {
  const timestamp = now();

  await db
    .prepare(
      `
      UPDATE users
      SET onboarding_completed_at = ?, updated_at = ?
      WHERE id = ?
    `
    )
    .bind(timestamp, timestamp, userId)
    .run();

  return findUserById(db, userId);
}
