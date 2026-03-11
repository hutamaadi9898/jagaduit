import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import {
  archiveCategory,
  getCategoryById,
  findCategoryByName,
  updateCategory
} from "@/server/repositories/categories";
import { categorySchema } from "@/server/validation";

export const PATCH: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const partial = categorySchema.partial({ kind: true }).parse(payload);
    const current = await getCategoryById(
      getDb(context.locals),
      context.locals.user.id,
      context.params.id!
    );

    if (!current) {
      return Response.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
    }

    const existing = await findCategoryByName(
      getDb(context.locals),
      context.locals.user.id,
      current.kind,
      partial.name ?? current.name,
      context.params.id
    );

    if (partial.name && existing) {
      return Response.json(
        { message: "Nama kategori untuk tipe ini sudah dipakai." },
        { status: 409 }
      );
    }

    const category = await updateCategory(
      getDb(context.locals),
      context.locals.user.id,
      context.params.id!,
      partial
    );

    return Response.json(category);
  } catch (error) {
    logError("category_update_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id,
      categoryId: context.params.id
    });
    return errorResponse(context.request, error, "Kategori gagal diperbarui.");
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const result = await archiveCategory(
    getDb(context.locals),
    context.locals.user.id,
    context.params.id!
  );

  if (result.status === "missing") {
    return Response.json({ message: "Kategori tidak ditemukan." }, { status: 404 });
  }

  if (result.status === "blocked") {
    return Response.json(
      { message: "Sisakan minimal satu kategori aktif untuk tipe ini." },
      { status: 400 }
    );
  }

  if (result.status === "system") {
    return Response.json(
      { message: "Kategori bawaan tidak bisa diarsipkan dari MVP ini." },
      { status: 400 }
    );
  }

  return Response.json(result);
};
