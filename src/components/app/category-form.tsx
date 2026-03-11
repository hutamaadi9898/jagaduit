import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types/app";

const iconOptions = [
  "UtensilsCrossed",
  "BusFront",
  "ReceiptText",
  "ShoppingBag",
  "Gift",
  "WalletCards",
  "Laptop",
  "CircleDollarSign"
];

const colorOptions = ["#f97316", "#22c55e", "#0ea5e9", "#ec4899", "#8b5cf6", "#f59e0b"];

export function CategoryForm({ category }: { category?: Category | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(category ? `/api/categories/${category.id}` : "/api/categories", {
      method: category ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Kategori gagal disimpan.");
      setLoading(false);
      return;
    }

    window.location.href = "/app/categories";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nama kategori</Label>
        <Input id="name" name="name" defaultValue={category?.name} placeholder="Misalnya Nongkrong" required />
      </div>
      {!category ? (
        <div className="space-y-2">
          <Label htmlFor="kind">Tipe kategori</Label>
          <select
            id="kind"
            name="kind"
            defaultValue="expense"
            className="h-12 w-full rounded-[1.2rem] border border-border bg-white/80 px-4 text-sm"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="kind" value={category.kind} />
      )}
      <div className="space-y-2">
        <Label htmlFor="icon">Ikon</Label>
        <select
          id="icon"
          name="icon"
          defaultValue={category?.icon ?? "ReceiptText"}
          className="h-12 w-full rounded-[1.2rem] border border-border bg-white/80 px-4 text-sm"
        >
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <label
              key={color}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-3 py-2"
            >
              <input type="radio" name="color" value={color} defaultChecked={(category?.color ?? "#f97316") === color} />
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            </label>
          ))}
        </div>
      </div>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {category ? "Simpan Kategori" : "Tambah Kategori"}
      </Button>
    </form>
  );
}
