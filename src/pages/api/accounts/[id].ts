import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import {
  archiveAccount,
  updateAccount
} from "@/server/repositories/accounts";
import { accountSchema } from "@/server/validation";

export const PATCH: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = accountSchema.parse(payload);
    const account = await updateAccount(
      getDb(context.locals),
      context.locals.user.id,
      context.params.id!,
      data
    );

    if (!account) {
      return Response.json({ message: "Akun tidak ditemukan." }, { status: 404 });
    }

    return Response.json(account);
  } catch (error) {
    logError("account_update_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id,
      accountId: context.params.id
    });
    return errorResponse(context.request, error, "Akun gagal diperbarui.");
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const result = await archiveAccount(getDb(context.locals), context.locals.user.id, context.params.id!);

  if (result.status === "missing") {
    return Response.json({ message: "Akun tidak ditemukan." }, { status: 404 });
  }

  if (result.status === "blocked") {
    return Response.json(
      { message: "Tidak bisa mengarsipkan akun terakhir yang masih aktif." },
      { status: 400 }
    );
  }

  return Response.json(result);
};
