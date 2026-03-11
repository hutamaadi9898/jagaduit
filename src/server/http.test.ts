import { describe, expect, it } from "vitest";

import { successResponse } from "@/server/http";

describe("http helpers", () => {
  it("returns a redirect response for non-json form posts", async () => {
    const request = new Request("https://example.com/api/auth/logout", {
      method: "POST",
      headers: {
        accept: "text/html,application/xhtml+xml"
      }
    });

    const response = successResponse(
      request,
      { ok: true },
      {
        redirectTo: "/login"
      }
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/login");
  });

  it("returns json for json requests even when a redirect target exists", async () => {
    const request = new Request("https://example.com/api/auth/login", {
      method: "POST",
      headers: {
        accept: "application/json"
      }
    });

    const response = successResponse(
      request,
      { ok: true },
      {
        redirectTo: "/app"
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
