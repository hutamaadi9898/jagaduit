import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Account, Category, TransactionWithRelations } from "@/types/app";

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  transaction?: TransactionWithRelations | null;
  recentDefaults?: {
    kind: "income" | "expense";
    accountId?: string;
    categoryByKind: Partial<Record<"income" | "expense", string>>;
  } | null;
};

export function TransactionForm({
  accounts,
  categories,
  transaction,
  recentDefaults
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultKind = transaction?.kind ?? recentDefaults?.kind ?? "expense";
  const [kind, setKind] = useState(defaultKind);
  const defaultAccountId =
    transaction?.accountId ??
    recentDefaults?.accountId ??
    accounts.find((item) => item.isDefault && !item.isArchived)?.id ??
    accounts.find((item) => !item.isArchived)?.id ??
    "";
  const defaultCategoryId =
    transaction?.categoryId ??
    recentDefaults?.categoryByKind?.[defaultKind] ??
    categories.find((category) => category.kind === defaultKind && !category.isArchived)?.id ??
    "";
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.kind === kind && !category.isArchived),
    [categories, kind]
  );
  const hasMatchingCategory = filteredCategories.some((category) => category.id === categoryId);

  useEffect(() => {
    if (hasMatchingCategory) {
      return;
    }

    setCategoryId(filteredCategories[0]?.id ?? "");
  }, [categoryId, filteredCategories, hasMatchingCategory]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountId) {
      setError("Pilih akun aktif dulu sebelum menyimpan transaksi.");
      return;
    }

    if (!categoryId) {
      setError("Kategori untuk jenis transaksi ini belum tersedia.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string | number> = {
      ...Object.fromEntries(formData.entries()),
      accountId,
      categoryId,
      kind,
      amountMinor: Number(formData.get("amountMinor"))
    };

    try {
      const response = await fetch(transaction ? `/api/transactions/${transaction.id}` : "/api/transactions", {
        method: transaction ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(data?.message ?? "Transaksi gagal disimpan.");
        setLoading(false);
        return;
      }

      const targetMonth =
        String(payload.transactionDate ?? "").slice(0, 7) ||
        new Date().toISOString().slice(0, 7);
      window.location.href = `/app/transactions?month=${targetMonth}`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Transaksi gagal dikirim.");
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="kind">Jenis transaksi</Label>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as "income" | "expense")}
          className="h-12 w-full rounded-[1.2rem] border border-border bg-card/80 px-4 text-sm"
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amountMinor">Nominal</Label>
        <Input
          id="amountMinor"
          name="amountMinor"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={transaction?.amountMinor}
          placeholder="50000"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountId">Akun</Label>
          <select
            id="accountId"
            name="accountId"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="h-12 w-full rounded-[1.2rem] border border-border bg-card/80 px-4 text-sm"
            required
          >
            {accounts
              .filter((account) => !account.isArchived)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategori</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-12 w-full rounded-[1.2rem] border border-border bg-card/80 px-4 text-sm"
            required
            disabled={filteredCategories.length === 0}
          >
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {filteredCategories.length === 0 ? (
            <p className="text-xs text-destructive">Belum ada kategori aktif untuk jenis transaksi ini.</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="transactionDate">Tanggal</Label>
        <Input
          id="transactionDate"
          name="transactionDate"
          type="date"
          defaultValue={transaction?.transactionDate ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Catatan</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={transaction?.note ?? ""}
          placeholder="Contoh: kopi sore, bonus freelance, atau bayar listrik"
        />
      </div>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {transaction ? "Update Transaksi" : "Simpan Transaksi"}
      </Button>
    </form>
  );
}
