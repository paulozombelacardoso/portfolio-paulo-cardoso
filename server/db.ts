import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";

const { Pool, types } = pg;

// Keep DATE / TIMESTAMPTZ values as ISO strings in the API layer.
types.setTypeParser(1082, (value: string) => value);
types.setTypeParser(1114, (value: string) => new Date(`${value}Z`).toISOString());
types.setTypeParser(1184, (value: string) => new Date(value).toISOString());
// COUNT(*) and BIGINT columns: return numbers instead of strings.
types.setTypeParser(20, (value: string) => Number(value));

export const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.poolMax,
  ssl: config.database.ssl,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on("error", (error) => {
  logger.error("Erro inesperado no pool PostgreSQL.", { error });
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(sql, params);
}

export async function all<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

export async function one<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const result = await pool.query<T>(sql, params);
  return result.rows[0];
}

export async function execute(sql: string, params: unknown[] = []) {
  return pool.query(sql, params);
}

export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function now() {
  return new Date().toISOString();
}

export async function logActivity(input: {
  userId?: string | null;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  title?: string;
}) {
  try {
    await execute(
      `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        randomUUID(),
        input.userId || null,
        input.userName || "",
        input.action,
        input.resourceType,
        input.resourceId || "",
        (input.title || "").slice(0, 300),
        now()
      ]
    );
  } catch (error) {
    logger.warn("Não foi possível registar a actividade.", { error });
  }
}

export async function pruneExpiredSessions() {
  await execute("DELETE FROM sessions WHERE expires_at <= NOW()");
}

export async function getSettingsRow() {
  return one<{ id: number; data: Record<string, unknown>; updated_at: string }>(
    "SELECT * FROM settings WHERE id = 1"
  );
}

export async function getSettings() {
  const row = await getSettingsRow();
  if (!row) return null;
  if (typeof row.data === "string") {
    try {
      return JSON.parse(row.data) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return row.data;
}

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "db", "migrations");

export async function runMigrations() {
  await execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const applied = await one("SELECT 1 FROM schema_migrations WHERE id = $1", [file]);
    if (applied) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await transaction(async (client) => {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [file]);
    });
    logger.info("Migração aplicada.", { file });
  }
}

export async function waitForDatabase(attempts = 20) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === attempts) {
        logger.error("PostgreSQL indisponível após várias tentativas.", { error });
        throw error;
      }
      logger.warn("PostgreSQL ainda indisponível; nova tentativa em 1s.", { attempt });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

export async function closeDb() {
  await pool.end();
}

/** Convert SQLite-style "?" placeholders into PostgreSQL "$n" placeholders. */
export function toPgPlaceholders(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

/**
 * Async helper with a prepare/get/all/run API (placeholders "?"),
 * kept so the route code reads like the original implementation.
 */
export const db = {
  pool,
  query,
  prepare: (sql: string) => {
    const text = toPgPlaceholders(sql);
    return {
      get: async <T = any>(...params: unknown[]) => (await pool.query(text, params)).rows[0] as T | undefined,
      all: async <T = any>(...params: unknown[]) => (await pool.query(text, params)).rows as T[],
      run: async (...params: unknown[]) => pool.query(text, params)
    };
  }
};

/** Run a "?"-style statement inside a transaction client. */
export function clientRun(client: pg.PoolClient, sql: string, ...params: unknown[]) {
  return client.query(toPgPlaceholders(sql), params);
}
