import { ZodError } from "zod";

type SuccessOptions = {
  status?: number;
  redirectTo?: string;
};

export async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export function successResponse(request: Request, payload: unknown, options?: SuccessOptions) {
  const acceptsJson =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("content-type")?.includes("application/json");

  if (acceptsJson || !options?.redirectTo) {
    return Response.json(payload, {
      status: options?.status ?? 200
    });
  }

  return Response.redirect(new URL(options.redirectTo, request.url), 302);
}

export function errorResponse(_request: Request, error: unknown, fallbackMessage = "Terjadi kesalahan.") {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
        message: fallbackMessage,
        issues: error.flatten()
      },
      { status: 400 }
    );
  }

  if (error instanceof Response) {
    return error;
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return Response.json(
    {
      error: "REQUEST_FAILED",
      message
    },
    { status: 503 }
  );
}
