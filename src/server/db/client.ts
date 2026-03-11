export function getDb(locals: App.Locals) {
  return locals.runtime.env.DB;
}

export function getKv(locals: App.Locals) {
  return locals.runtime.env.APP_KV;
}

export type DbClient = D1Database | D1DatabaseSession;

export async function runInSession<T>(
  db: D1Database,
  work: (client: DbClient) => Promise<T>
) {
  // D1 sessions give sequential consistency for related reads and writes
  // without relying on transaction-control statements through `exec()`.
  return work(db.withSession("first-primary"));
}
