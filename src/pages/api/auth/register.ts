import type { APIRoute } from "astro";

import { createLucia, passwordHasher } from "@/server/auth/lucia";
import { getDb } from "@/server/db/client";
import { errorResponse, readPayload, successResponse } from "@/server/http";
import { createUser, findUserByEmail } from "@/server/repositories/users";
import { getRequestMeta, logError, logWarn } from "@/server/observability";
import { authSchema } from "@/server/validation";

export const POST: APIRoute = async (context) => {
  try {
    const db = getDb(context.locals);
    const auth = createLucia(db);
    const payload = await readPayload(context.request);
    const data = authSchema.parse(payload);

    const existing = await findUserByEmail(db, data.email);
    if (existing) {
      logWarn("auth_register_duplicate_email", {
        ...getRequestMeta(context.request),
        email: data.email.toLowerCase()
      });
      return Response.json(
        {
          message: "Email sudah terdaftar."
        },
        { status: 409 }
      );
    }

    const passwordHash = await passwordHasher.hash(data.password);
    const user = await createUser(db, {
      email: data.email,
      displayName: data.displayName,
      locale: "id-ID",
      currency: "IDR",
      timezone: "Asia/Jakarta",
      passwordHash
    });

    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return successResponse(
      context.request,
      {
        user
      },
      {
        status: 201,
        redirectTo: "/app/onboarding"
      }
    );
  } catch (error) {
    logError("auth_register_failed", error, getRequestMeta(context.request));
    return errorResponse(context.request, error, "Pendaftaran gagal diproses.");
  }
};
