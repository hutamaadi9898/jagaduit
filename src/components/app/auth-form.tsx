import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Terjadi kendala. Coba lagi.");
      setLoading(false);
      return;
    }

    window.location.href = "/app";
  }

  return (
    <Card className="relative overflow-hidden p-0">
      <div className="noise-overlay absolute inset-0" />
      <CardHeader className="relative px-6 pb-0 pt-6">
        <CardTitle className="text-2xl">
          {mode === "login" ? "Masuk dan cek uangmu" : "Bikin akun biar cashflow tetap kebaca"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Masuk cepat, lihat ringkasan bulan ini, lalu lanjut catat transaksi."
            : "Daftar sekali, dapat kategori starter Indonesia, dan langsung siap catat pemasukan serta pengeluaran."}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative px-6 pb-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama panggilan</Label>
              <Input id="displayName" name="displayName" placeholder="Misalnya Naya" required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="kamu@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" placeholder="Minimal 8 karakter" required />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Masuk Sekarang" : "Mulai Pakai KitaCuan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
