import type { APIRoute } from "astro";

import { createLucia } from "@/server/auth/lucia";
import { getDb } from "@/server/db/client";
import { errorResponse, successResponse } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";

export const POST: APIRoute = async (context) => {
  try {
    const db = getDb(context.locals);
    const auth = createLucia(db);

    if (context.locals.session) {
      await auth.invalidateSession(context.locals.session.id);
    }

    const blankCookie = auth.createBlankSessionCookie();
    context.cookies.set(blankCookie.name, blankCookie.value, blankCookie.attributes);

    return successResponse(
      context.request,
      {
        ok: true
      },
      {
        redirectTo: "/login"
      }
    );
  } catch (error) {
    logError("auth_logout_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Logout gagal diproses.");
  }
};
