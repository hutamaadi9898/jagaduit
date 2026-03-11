import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import { updateUserProfile } from "@/server/repositories/users";
import { settingsSchema } from "@/server/validation";

export const PATCH: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = settingsSchema.parse(payload);
    const user = await updateUserProfile(getDb(context.locals), context.locals.user.id, data);
    return Response.json(user);
  } catch (error) {
    logError("settings_update_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Pengaturan gagal diperbarui.");
  }
};
