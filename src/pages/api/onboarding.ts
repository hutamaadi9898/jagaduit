import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import { applyOnboarding } from "@/server/services/onboarding";
import { onboardingSchema } from "@/server/validation";

export const POST: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = onboardingSchema.parse(payload);

    await applyOnboarding(getDb(context.locals), context.locals.user.id, data);

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    logError("onboarding_apply_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Onboarding belum berhasil disimpan.");
  }
};
