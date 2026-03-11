export function getDb(locals: App.Locals) {
  return locals.runtime.env.DB;
}

export function getKv(locals: App.Locals) {
  return locals.runtime.env.APP_KV;
}

export async function runInTransaction<T>(
  db: D1Database,
  work: (tx: D1Database) => Promise<T>
) {
  await db.exec("BEGIN");
  try {
    const result = await work(db);
    await db.exec("COMMIT");
    return result;
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
}
