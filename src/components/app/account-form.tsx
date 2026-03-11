import { LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Account } from "@/types/app";

const accountTypes = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-Wallet" }
] as const;

const colorOptions = ["#f97316", "#22c55e", "#0ea5e9", "#ec4899", "#8b5cf6", "#f59e0b"];

export function AccountForm({ account }: { account?: Account | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLabel = useMemo(() => (account ? "Simpan Perubahan" : "Tambah Akun"), [account]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      isDefault: formData.get("isDefault") === "on"
    };

    const response = await fetch(account ? `/api/accounts/${account.id}` : "/api/accounts", {
      method: account ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Akun gagal disimpan.");
      setLoading(false);
      return;
    }

    window.location.href = "/app/accounts";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nama akun</Label>
        <Input id="name" name="name" defaultValue={account?.name} placeholder="Misalnya BCA Utama" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Jenis akun</Label>
        <select
          id="type"
          name="type"
          defaultValue={account?.type ?? "cash"}
          className="h-12 w-full rounded-[1.2rem] border border-border bg-white/80 px-4 text-sm"
        >
          {accountTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Pilih warna</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <label
              key={color}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-3 py-2"
            >
              <input type="radio" name="color" value={color} defaultChecked={(account?.color ?? "#f97316") === color} />
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <input type="checkbox" name="isDefault" defaultChecked={account?.isDefault ?? !account} />
        Jadikan akun utama
      </label>
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
