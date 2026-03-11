import type { APIRoute } from "astro";

import { getDb, getKv } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError, logWarn } from "@/server/observability";
import { getDefaultAccount } from "@/server/repositories/accounts";
import {
  createTransaction,
  listTransactions
} from "@/server/repositories/transactions";
import { invalidateDashboardCache } from "@/server/services/dashboard";
import { transactionFiltersSchema, transactionSchema } from "@/server/validation";

export const GET: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const filters = transactionFiltersSchema.parse(Object.fromEntries(context.url.searchParams.entries()));
  const transactions = await listTransactions(getDb(context.locals), context.locals.user.id, filters);
  return Response.json(transactions);
};

export const POST: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = transactionSchema.parse(payload);
    const defaultAccount = await getDefaultAccount(getDb(context.locals), context.locals.user.id);

    if (!defaultAccount) {
      logWarn("transaction_create_blocked_missing_default_account", {
        ...getRequestMeta(context.request),
        userId: context.locals.user.id
      });
      return Response.json(
        {
          message: "Atur satu akun utama aktif dulu sebelum menambah transaksi."
        },
        { status: 400 }
      );
    }

    const result = await createTransaction(getDb(context.locals), context.locals.user.id, data);

    if (result.status !== "created") {
      logWarn("transaction_create_rejected", {
        ...getRequestMeta(context.request),
        userId: context.locals.user.id,
        status: result.status
      });
      return Response.json(
        {
          message:
            result.status === "invalid-account"
              ? "Akun tidak valid atau sudah diarsipkan."
              : "Kategori tidak valid untuk jenis transaksi ini."
        },
        { status: 400 }
      );
    }

    await invalidateDashboardCache(getKv(context.locals), context.locals.user.id, [
      result.transaction!.transactionDate.slice(0, 7)
    ]);

    return Response.json(result.transaction, { status: 201 });
  } catch (error) {
    logError("transaction_create_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Transaksi gagal dibuat.");
  }
};
