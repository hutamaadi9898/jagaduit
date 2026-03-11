import { describe, expect, it } from "vitest";

import { formatMonthLabel, monthFromDate } from "@/lib/utils";

describe("utils", () => {
  it("formats Indonesian month labels", () => {
    expect(formatMonthLabel("2026-03")).toContain("2026");
  });

  it("creates YYYY-MM month keys", () => {
    expect(monthFromDate(new Date("2026-03-06T00:00:00.000Z"))).toBe("2026-03");
  });
});
