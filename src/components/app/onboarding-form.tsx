import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StarterCategory = {
  name: string;
  kind: "income" | "expense";
  icon: string;
  color: string;
};

type OnboardingFormProps = {
  displayName: string;
  starterCategories: StarterCategory[];
};

const accountTypes = [
  { value: "cash", label: "Dompet tunai" },
  { value: "bank", label: "Rekening bank" },
  { value: "ewallet", label: "E-wallet" }
] as const;

const colorOptions = ["#f97316", "#22c55e", "#0ea5e9", "#ec4899", "#8b5cf6", "#f59e0b"];

export function OnboardingForm({
  displayName,
  starterCategories
}: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultSelected = starterCategories.map((category) => category.name);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      displayName: String(formData.get("displayName") ?? ""),
      accountName: String(formData.get("accountName") ?? ""),
      accountType: String(formData.get("accountType") ?? "cash"),
      accountColor: String(formData.get("accountColor") ?? "#f97316"),
      selectedCategories: formData.getAll("selectedCategories").map(String)
    };

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Onboarding belum bisa disimpan.");
      setLoading(false);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="displayName">Nama panggilan</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountName">Akun pertama</Label>
          <Input
            id="accountName"
            name="accountName"
            defaultValue="Dompet Harian"
            placeholder="Misalnya Dompet Harian"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountType">Jenis akun</Label>
          <select
            id="accountType"
            name="accountType"
            defaultValue="cash"
            className="h-12 w-full rounded-[1.2rem] border border-border bg-white/80 px-4 text-sm"
          >
            {accountTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Warna akun</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <label
              key={color}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-3 py-2"
            >
              <input
                type="radio"
                name="accountColor"
                value={color}
                defaultChecked={color === "#f97316"}
              />
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Pilih starter kategori</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Centang yang paling sering kamu pakai. Sisakan minimal satu pemasukan dan satu pengeluaran.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {starterCategories.map((category) => (
            <label
              key={category.name}
              className="flex items-start gap-3 rounded-[1.2rem] border border-border bg-white/80 px-4 py-3"
            >
              <input
                type="checkbox"
                name="selectedCategories"
                value={category.name}
                defaultChecked={defaultSelected.includes(category.name)}
                className="mt-1"
              />
              <span
                className="mt-1 h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="flex-1">
                <span className="block font-semibold text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.kind === "income" ? "Pemasukan" : "Pengeluaran"} • {category.icon}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button className="w-full" size="lg" disabled={loading}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        Simpan dan masuk dashboard
      </Button>
    </form>
  );
}
