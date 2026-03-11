import type { APIRoute } from "astro";

import { getDb, getKv } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError, logWarn } from "@/server/observability";
import {
  deleteTransaction,
  updateTransaction
} from "@/server/repositories/transactions";
import { invalidateDashboardCache } from "@/server/services/dashboard";
import { transactionSchema } from "@/server/validation";

export const PATCH: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const partial = transactionSchema.partial().parse(payload);
    const result = await updateTransaction(
      getDb(context.locals),
      context.locals.user.id,
      context.params.id!,
      partial
    );

    if (result.status === "missing") {
      logWarn("transaction_update_missing", {
        ...getRequestMeta(context.request),
        userId: context.locals.user.id,
        transactionId: context.params.id
      });
      return Response.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (result.status === "invalid-account" || result.status === "invalid-category") {
      logWarn("transaction_update_rejected", {
        ...getRequestMeta(context.request),
        userId: context.locals.user.id,
        transactionId: context.params.id,
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

    return Response.json(result.transaction);
  } catch (error) {
    logError("transaction_update_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id,
      transactionId: context.params.id
    });
    return errorResponse(context.request, error, "Transaksi gagal diperbarui.");
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const result = await deleteTransaction(getDb(context.locals), context.locals.user.id, context.params.id!);

  if (result.status === "missing") {
    logWarn("transaction_delete_missing", {
      ...getRequestMeta(context.request),
      userId: context.locals.user.id,
      transactionId: context.params.id
    });
    return Response.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  await invalidateDashboardCache(getKv(context.locals), context.locals.user.id, [
    result.transaction.transactionDate.slice(0, 7)
  ]);

  return Response.json(result.transaction);
};
