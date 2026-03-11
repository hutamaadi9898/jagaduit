import type { APIRoute } from "astro";

import { createLucia, passwordHasher } from "@/server/auth/lucia";
import { getDb, getKv } from "@/server/db/client";
import { errorResponse, readPayload, successResponse } from "@/server/http";
import { getRequestMeta, logError, logWarn } from "@/server/observability";
import { findUserById, getPasswordHashByEmail } from "@/server/repositories/users";
import {
  checkLoginThrottle,
  recordLoginFailure,
  resetLoginThrottle
} from "@/server/services/throttle";
import { loginSchema } from "@/server/validation";

export const POST: APIRoute = async (context) => {
  try {
    const db = getDb(context.locals);
    const kv = getKv(context.locals);
    const auth = createLucia(db);
    const payload = await readPayload(context.request);
    const data = loginSchema.parse(payload);
    const ip =
      context.request.headers.get("cf-connecting-ip") ??
      context.clientAddress ??
      "0.0.0.0";

    const blockedUntil = await checkLoginThrottle(kv, data.email, ip);
    if (blockedUntil) {
      logWarn("auth_login_throttled", {
        ...getRequestMeta(context.request),
        email: data.email.toLowerCase(),
        ip
      });
      return Response.json(
        {
          message: `Terlalu banyak percobaan login. Coba lagi setelah ${new Date(blockedUntil).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          })}.`
        },
        { status: 429 }
      );
    }

    const credentials = await getPasswordHashByEmail(db, data.email);
    if (!credentials) {
      await recordLoginFailure(kv, data.email, ip);
      logWarn("auth_login_invalid_credentials", {
        ...getRequestMeta(context.request),
        email: data.email.toLowerCase(),
        ip
      });
      return Response.json(
        {
          message: "Email atau password salah."
        },
        { status: 401 }
      );
    }

    const valid = await passwordHasher.verify(credentials.password_hash, data.password);
    if (!valid) {
      await recordLoginFailure(kv, data.email, ip);
      logWarn("auth_login_invalid_credentials", {
        ...getRequestMeta(context.request),
        email: data.email.toLowerCase(),
        ip
      });
      return Response.json(
        {
          message: "Email atau password salah."
        },
        { status: 401 }
      );
    }

    const user = await findUserById(db, credentials.id);
    if (!user) {
      logWarn("auth_login_missing_user", {
        ...getRequestMeta(context.request),
        userId: credentials.id
      });
      return Response.json(
        {
          message: "Akun tidak ditemukan."
        },
        { status: 404 }
      );
    }

    await resetLoginThrottle(kv, data.email, ip);
    const session = await auth.createSession(user.id, {});
    const sessionCookie = auth.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return successResponse(
      context.request,
      {
        user
      },
      {
        redirectTo: user.onboardingCompletedAt ? "/app" : "/app/onboarding"
      }
    );
  } catch (error) {
    logError("auth_login_failed", error, getRequestMeta(context.request));
    return errorResponse(context.request, error, "Login gagal diproses.");
  }
};
