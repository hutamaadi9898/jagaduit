import { starterAccounts, starterCategories } from "@/server/constants/categories";
import { runInTransaction } from "@/server/db/client";
import { createAccount, listAccounts } from "@/server/repositories/accounts";
import { createCategory, listCategories } from "@/server/repositories/categories";
import { completeUserOnboarding, updateUserProfile } from "@/server/repositories/users";

export async function applyOnboarding(
  db: D1Database,
  userId: string,
  input: {
    displayName: string;
    accountName: string;
    accountType: "cash" | "bank" | "ewallet";
    accountColor: string;
    selectedCategories: string[];
  }
) {
  const selectedCategories = starterCategories.filter((category) =>
    input.selectedCategories.includes(category.name)
  );
  const hasExpense = selectedCategories.some((category) => category.kind === "expense");
  const hasIncome = selectedCategories.some((category) => category.kind === "income");

  if (!hasExpense || !hasIncome) {
    throw new Error("Pilih minimal satu kategori pemasukan dan satu kategori pengeluaran.");
  }

  await runInTransaction(db, async (tx) => {
    await updateUserProfile(tx, userId, {
      displayName: input.displayName
    });

    const existingAccounts = await listAccounts(tx, userId, true);
    if (existingAccounts.length === 0) {
      await createAccount(tx, userId, {
        name: input.accountName,
        type: input.accountType,
        color: input.accountColor,
        isDefault: true
      });
    }

    const existingCategories = await listCategories(tx, userId, true);
    if (existingCategories.length === 0) {
      for (const category of selectedCategories) {
        await createCategory(tx, userId, {
          ...category,
          isSystem: true
        });
      }
    }

    await completeUserOnboarding(tx, userId);
  });
}

export async function seedStarterData(db: D1Database, userId: string) {
  const existingAccounts = await listAccounts(db, userId, true);
  if (existingAccounts.length === 0) {
    for (const [index, account] of starterAccounts.entries()) {
      await createAccount(db, userId, {
        ...account,
        isDefault: index === 0
      });
    }
  }

  const existingCategories = await listCategories(db, userId, true);
  if (existingCategories.length === 0) {
    for (const category of starterCategories) {
      await createCategory(db, userId, {
        ...category,
        isSystem: true
      });
    }
  }
}
