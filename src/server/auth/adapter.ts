import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

export function createD1Adapter(db: D1Database): Adapter {
  return {
    async getSessionAndUser(sessionId) {
      const result = await db
        .prepare(
          `
          SELECT
            sessions.id AS session_id,
            sessions.user_id AS session_user_id,
            sessions.expires_at AS session_expires_at,
            users.id,
            users.email,
            users.display_name,
            users.locale,
            users.currency,
            users.timezone,
            users.onboarding_completed_at,
            users.created_at,
            users.updated_at
          FROM sessions
          INNER JOIN users ON users.id = sessions.user_id
          WHERE sessions.id = ?
          LIMIT 1
        `
        )
        .bind(sessionId)
        .first<Record<string, unknown>>();

      if (!result) {
        return [null, null];
      }

      const session: DatabaseSession = {
        id: String(result.session_id),
        userId: String(result.session_user_id),
        expiresAt: new Date(Number(result.session_expires_at)),
        attributes: {}
      };

      const user: DatabaseUser = {
        id: String(result.id),
        attributes: {
          email: String(result.email),
          displayName: String(result.display_name),
          locale: String(result.locale),
          currency: String(result.currency),
          timezone: String(result.timezone),
          onboardingCompletedAt: result.onboarding_completed_at
            ? Number(result.onboarding_completed_at)
            : null,
          createdAt: Number(result.created_at),
          updatedAt: Number(result.updated_at)
        }
      };

      return [session, user];
    },
    async getUserSessions(userId) {
      const { results } = await db
        .prepare(
          `
          SELECT id, user_id, expires_at
          FROM sessions
          WHERE user_id = ?
          ORDER BY created_at DESC
        `
        )
        .bind(userId)
        .all<Record<string, unknown>>();

      return results.map(
        (row) =>
          ({
            id: String(row.id),
            userId: String(row.user_id),
            expiresAt: new Date(Number(row.expires_at)),
            attributes: {}
          }) satisfies DatabaseSession
      );
    },
    async setSession(session) {
      await db
        .prepare(
          `
          INSERT INTO sessions (id, user_id, expires_at, created_at)
          VALUES (?, ?, ?, ?)
        `
        )
        .bind(session.id, session.userId, session.expiresAt.getTime(), Date.now())
        .run();
    },
    async updateSessionExpiration(sessionId, expiresAt) {
      await db
        .prepare("UPDATE sessions SET expires_at = ? WHERE id = ?")
        .bind(expiresAt.getTime(), sessionId)
        .run();
    },
    async deleteSession(sessionId) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    },
    async deleteUserSessions(userId) {
      await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
    },
    async deleteExpiredSessions() {
      await db
        .prepare("DELETE FROM sessions WHERE expires_at <= ?")
        .bind(Date.now())
        .run();
    }
  };
}
