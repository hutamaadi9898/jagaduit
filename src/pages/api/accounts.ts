import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import {
  createAccount,
  listAccounts
} from "@/server/repositories/accounts";
import { getRequestMeta, logError } from "@/server/observability";
import { accountSchema } from "@/server/validation";

export const GET: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const accounts = await listAccounts(getDb(context.locals), context.locals.user.id, true);
  return Response.json(accounts);
};

export const POST: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = accountSchema.parse(payload);
    const account = await createAccount(getDb(context.locals), context.locals.user.id, data);
    return Response.json(account, { status: 201 });
  } catch (error) {
    logError("account_create_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Akun gagal dibuat.");
  }
};
