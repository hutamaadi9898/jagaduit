import type { AccountType, CategoryKind } from "@/types/app";

export const APP_NAME = "KitaCuan";

export const accountTypeLabels: Record<AccountType, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet"
};

export const starterCategories: Array<{
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
}> = [
  { name: "Makan", kind: "expense", icon: "UtensilsCrossed", color: "#f97316" },
  { name: "Transport", kind: "expense", icon: "BusFront", color: "#14b8a6" },
  { name: "Jajan", kind: "expense", icon: "CupSoda", color: "#ec4899" },
  { name: "Tagihan", kind: "expense", icon: "ReceiptText", color: "#6366f1" },
  { name: "Belanja", kind: "expense", icon: "ShoppingBag", color: "#ef4444" },
  { name: "Gaji", kind: "income", icon: "WalletCards", color: "#22c55e" },
  { name: "Freelance", kind: "income", icon: "Laptop", color: "#0ea5e9" },
  { name: "Hadiah", kind: "income", icon: "Gift", color: "#a855f7" },
  { name: "Top Up", kind: "income", icon: "ArrowDownToLine", color: "#f59e0b" }
];

export const starterAccounts = [
  { name: "Dompet Utama", type: "cash" as const, color: "#f97316" },
  { name: "Bank Harian", type: "bank" as const, color: "#0ea5e9" },
  { name: "E-Wallet", type: "ewallet" as const, color: "#22c55e" }
];
