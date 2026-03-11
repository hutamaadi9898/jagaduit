import { LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
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
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
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
        setError(data?.message ?? "Lagi ada kendala. Coba lagi bentar.");
        setLoading(false);
        return;
      }

      window.location.href = "/app";
    } catch {
      setError("Koneksi lagi nggak beres. Coba kirim lagi.");
      setLoading(false);
    }
  }

  return (
    <Card className="auth-form-shell relative overflow-hidden border-0 p-0">
      <div className="noise-overlay absolute inset-0" />
      <CardHeader className="relative px-6 pb-0 pt-6 sm:px-7 sm:pt-7">
        <div className="auth-form-badge">
          {isLogin ? <ShieldCheck className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {isLogin ? "Masuk" : "Daftar"}
        </div>
        <CardTitle className="mt-4 text-[1.9rem] leading-tight sm:text-[2.2rem]">
          {isLogin ? "Masuk ke akunmu" : "Bikin akun baru"}
        </CardTitle>
        <CardDescription className="mt-3 max-w-md text-sm leading-6">
          {isLogin
            ? "Masukkan email dan password."
            : "Isi data singkat untuk mulai pakai KitaCuan."}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative px-6 pb-6 sm:px-7 sm:pb-7">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama panggilan</Label>
              <Input id="displayName" name="displayName" placeholder="Misalnya Caca" required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="nama@contoh.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" placeholder="Minimal 8 karakter" required />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isLogin ? "Masuk dan lanjut cek" : "Gas bikin akun"}
          </Button>
          <p className="text-center text-xs leading-5 text-muted-foreground">
            {isLogin
              ? "Belum punya akun? daftar dulu."
              : "Sudah punya akun? masuk aja."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
