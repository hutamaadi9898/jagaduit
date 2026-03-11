import type { APIRoute } from "astro";

import { getDb, getKv } from "@/server/db/client";
import { errorResponse } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import { getDashboardSummary } from "@/server/services/dashboard";

export const GET: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const month = context.url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const summary = await getDashboardSummary(
      getDb(context.locals),
      getKv(context.locals),
      context.locals.user.id,
      month
    );

    return Response.json(summary);
  } catch (error) {
    logError("dashboard_summary_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Ringkasan dashboard belum bisa dimuat.");
  }
};
