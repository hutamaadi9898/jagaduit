import { z } from "zod";

const today = new Date().toISOString().slice(0, 10);

export const authSchema = z.object({
  email: z.string().email("Email tidak valid.").max(120),
  password: z.string().min(8, "Password minimal 8 karakter.").max(72),
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(48)
});

export const loginSchema = authSchema.pick({
  email: true,
  password: true
});

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Nama akun terlalu pendek.").max(40),
  type: z.enum(["cash", "bank", "ewallet"]),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Warna harus hex."),
  isDefault: z.coerce.boolean().optional()
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori terlalu pendek.").max(32),
  kind: z.enum(["income", "expense"]),
  icon: z.string().trim().min(2).max(40),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Warna harus hex.")
});

export const transactionSchema = z.object({
  accountId: z.string().min(10),
  categoryId: z.string().min(10),
  kind: z.enum(["income", "expense"]),
  amountMinor: z.coerce.number().int().positive("Nominal harus lebih besar dari 0."),
  note: z.string().trim().max(160).optional().or(z.literal("")),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
    .refine((value) => value <= today, "Tanggal tidak boleh di masa depan.")
});

export const settingsSchema = z.object({
  displayName: z.string().trim().min(2).max(48),
  locale: z.string().default("id-ID"),
  timezone: z.string().default("Asia/Jakarta")
});

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(48),
  accountName: z.string().trim().min(2).max(40),
  accountType: z.enum(["cash", "bank", "ewallet"]),
  accountColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Warna harus hex."),
  selectedCategories: z.array(z.string().trim().min(2)).min(2)
});

export const transactionFiltersSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(new Date().toISOString().slice(0, 7)),
  kind: z.enum(["all", "income", "expense"]).default("all"),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  query: z.string().trim().max(80).optional()
});

export function normalizeCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}
