type LogMeta = Record<string, unknown>;

export function getRequestMeta(request: Request) {
  const url = new URL(request.url);

  return {
    method: request.method,
    path: url.pathname,
    search: url.search,
    userAgent: request.headers.get("user-agent") ?? "unknown"
  };
}

export function logInfo(event: string, meta: LogMeta = {}) {
  console.info(JSON.stringify({ level: "info", event, ...meta }));
}

export function logWarn(event: string, meta: LogMeta = {}) {
  console.warn(JSON.stringify({ level: "warn", event, ...meta }));
}

export function logError(event: string, error: unknown, meta: LogMeta = {}) {
  const details =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : { error: String(error) };

  console.error(JSON.stringify({ level: "error", event, ...meta, details }));
}
