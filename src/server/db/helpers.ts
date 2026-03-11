import type {
  Account,
  Category,
  TransactionWithRelations,
  User
} from "@/types/app";

type DbBoolean = 0 | 1 | number;

export function now() {
  return Date.now();
}

export function fromDbBoolean(value: DbBoolean) {
  return Number(value) === 1;
}

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    locale: String(row.locale),
    currency: String(row.currency),
    timezone: String(row.timezone),
    onboardingCompletedAt: row.onboarding_completed_at
      ? Number(row.onboarding_completed_at)
      : null,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

export function mapAccount(row: Record<string, unknown>): Account {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    type: row.type as Account["type"],
    color: String(row.color),
    isDefault: fromDbBoolean(row.is_default as DbBoolean),
    isArchived: fromDbBoolean(row.is_archived as DbBoolean),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    kind: row.kind as Category["kind"],
    icon: String(row.icon),
    color: String(row.color),
    isSystem: fromDbBoolean(row.is_system as DbBoolean),
    isArchived: fromDbBoolean(row.is_archived as DbBoolean),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

export function mapTransaction(row: Record<string, unknown>): TransactionWithRelations {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    accountId: String(row.account_id),
    categoryId: String(row.category_id),
    kind: row.kind as TransactionWithRelations["kind"],
    amountMinor: Number(row.amount_minor),
    note: row.note ? String(row.note) : null,
    transactionDate: String(row.transaction_date),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    accountName: String(row.account_name),
    accountColor: String(row.account_color),
    categoryName: String(row.category_name),
    categoryColor: String(row.category_color),
    categoryIcon: String(row.category_icon)
  };
}

export function toMonthRange(month: string) {
  const [year, monthValue] = month.split("-").map(Number);
  const start = `${year}-${String(monthValue).padStart(2, "0")}-01`;
  const nextMonth = monthValue === 12 ? 1 : monthValue + 1;
  const nextYear = monthValue === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}
