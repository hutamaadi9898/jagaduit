export type User = {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  currency: string;
  timezone: string;
  onboardingCompletedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type SessionUser = Pick<User, "id" | "email" | "displayName">;

export type AccountType = "cash" | "bank" | "ewallet";
export type CategoryKind = "income" | "expense";
export type TransactionKind = CategoryKind;

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  color: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
  isSystem: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  kind: TransactionKind;
  amountMinor: number;
  note: string | null;
  transactionDate: string;
  createdAt: number;
  updatedAt: number;
};

export type TransactionWithRelations = Transaction & {
  accountName: string;
  accountColor: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
};

export type DashboardSummary = {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  topCategories: Array<{
    categoryId: string;
    name: string;
    color: string;
    icon: string;
    total: number;
  }>;
  dailySeries: Array<{
    date: string;
    totalExpense: number;
  }>;
};
