import { describe, expect, it, vi } from "vitest";

import { runInSession } from "@/server/db/client";

describe("db client", () => {
  it("runs work against a D1 session instead of exec-based transactions", async () => {
    const session = {
      prepare: vi.fn(),
      batch: vi.fn()
    } as unknown as D1DatabaseSession;

    const withSession = vi.fn().mockReturnValue(session);
    const db = {
      withSession
    } as unknown as D1Database;
    const work = vi.fn().mockResolvedValue("ok");

    const result = await runInSession(db, work);

    expect(result).toBe("ok");
    expect(withSession).toHaveBeenCalledWith("first-primary");
    expect(work).toHaveBeenCalledWith(session);
  });
});
