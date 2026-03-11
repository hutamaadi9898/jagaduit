import type { APIRoute } from "astro";

import { getDb } from "@/server/db/client";
import { errorResponse, readPayload } from "@/server/http";
import { getRequestMeta, logError } from "@/server/observability";
import {
  createCategory,
  findCategoryByName,
  listCategories
} from "@/server/repositories/categories";
import { categorySchema } from "@/server/validation";

export const GET: APIRoute = async (context) => {
  if (!context.locals.user) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }

  const categories = await listCategories(getDb(context.locals), context.locals.user.id, true);
  return Response.json(categories);
};

export const POST: APIRoute = async (context) => {
  try {
    if (!context.locals.user) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const payload = await readPayload(context.request);
    const data = categorySchema.parse(payload);
    const duplicate = await findCategoryByName(
      getDb(context.locals),
      context.locals.user.id,
      data.kind,
      data.name
    );

    if (duplicate) {
      return Response.json(
        { message: "Nama kategori untuk tipe ini sudah dipakai." },
        { status: 409 }
      );
    }

    const category = await createCategory(getDb(context.locals), context.locals.user.id, data);
    return Response.json(category, { status: 201 });
  } catch (error) {
    logError("category_create_failed", error, {
      ...getRequestMeta(context.request),
      userId: context.locals.user?.id
    });
    return errorResponse(context.request, error, "Kategori gagal dibuat.");
  }
};
