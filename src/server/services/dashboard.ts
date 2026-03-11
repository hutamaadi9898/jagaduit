import { toMonthRange } from "@/server/db/helpers";
import type { DashboardSummary } from "@/types/app";

const DASHBOARD_CACHE_TTL = 60 * 10;

export async function getDashboardSummary(
  db: D1Database,
  kv: KVNamespace,
  userId: string,
  month: string
) {
  const key = getDashboardCacheKey(userId, month);
  const cached = await kv.get<DashboardSummary>(key, "json");

  if (cached) {
    return cached;
  }

  const { start, end } = toMonthRange(month);

  const totals = await db
    .prepare(
      `
      SELECT
        COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_minor ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_minor ELSE 0 END), 0) AS total_expense
      FROM transactions
      WHERE user_id = ? AND transaction_date >= ? AND transaction_date < ?
    `
    )
    .bind(userId, start, end)
    .first<{ total_income: number; total_expense: number }>();

  const { results: topCategories } = await db
    .prepare(
      `
      SELECT
        c.id AS category_id,
        c.name,
        c.color,
        c.icon,
        SUM(t.amount_minor) AS total
      FROM transactions t
      INNER JOIN categories c ON c.id = t.category_id
      WHERE
        t.user_id = ?
        AND t.kind = 'expense'
        AND t.transaction_date >= ?
        AND t.transaction_date < ?
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total DESC
      LIMIT 5
    `
    )
    .bind(userId, start, end)
    .all<Record<string, unknown>>();

  const { results: dailySeries } = await db
    .prepare(
      `
      SELECT
        transaction_date AS date,
        SUM(amount_minor) AS total_expense
      FROM transactions
      WHERE
        user_id = ?
        AND kind = 'expense'
        AND transaction_date >= ?
        AND transaction_date < ?
      GROUP BY transaction_date
      ORDER BY transaction_date ASC
    `
    )
    .bind(userId, start, end)
    .all<Record<string, unknown>>();

  const summary: DashboardSummary = {
    month,
    totalIncome: Number(totals?.total_income ?? 0),
    totalExpense: Number(totals?.total_expense ?? 0),
    netBalance: Number(totals?.total_income ?? 0) - Number(totals?.total_expense ?? 0),
    topCategories: topCategories.map((row) => ({
      categoryId: String(row.category_id),
      name: String(row.name),
      color: String(row.color),
      icon: String(row.icon),
      total: Number(row.total)
    })),
    dailySeries: dailySeries.map((row) => ({
      date: String(row.date),
      totalExpense: Number(row.total_expense)
    }))
  };

  await kv.put(key, JSON.stringify(summary), {
    expirationTtl: DASHBOARD_CACHE_TTL
  });

  return summary;
}

export async function invalidateDashboardCache(
  kv: KVNamespace,
  userId: string,
  months: string[]
) {
  await Promise.all(
    [...new Set(months)].map((month) => kv.delete(getDashboardCacheKey(userId, month)))
  );
}

function getDashboardCacheKey(userId: string, month: string) {
  return `dashboard:${userId}:${month}`;
}
