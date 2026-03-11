import { describe, expect, it } from "vitest";

import { authSchema, transactionSchema } from "@/server/validation";

describe("validation", () => {
  it("accepts valid registration payload", () => {
    const result = authSchema.safeParse({
      email: "user@example.com",
      password: "rahasia123",
      displayName: "Naya"
    });

    expect(result.success).toBe(true);
  });

  it("rejects future transaction dates", () => {
    const result = transactionSchema.safeParse({
      accountId: "abcdefghijk",
      categoryId: "lmnopqrstuv",
      kind: "expense",
      amountMinor: 15000,
      note: "kopi",
      transactionDate: "2099-01-01"
    });

    expect(result.success).toBe(false);
  });
});
