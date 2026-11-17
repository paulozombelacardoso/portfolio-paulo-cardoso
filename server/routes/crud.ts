import { Router, type Request } from "express";
import type { ZodTypeAny } from "zod";
import { db, logActivity, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, clamp, escapeLike, parseJson, randomId } from "../lib/util.js";
import { requireRole } from "../middleware/auth.js";
import { reorderInput } from "../schemas.js";

export interface CrudContext {
  mode: "create" | "update";
  id: string;
  existing?: Record<string, unknown>;
}

export interface CrudConfig {
  table: string;
  key: string;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  searchColumns: string[];
  filters?: Record<string, string>;
  orderBy?: string;
  prepare: (input: any, context: CrudContext) => Record<string, unknown>;
  serialize: (row: any) => any;
  label: (row: any) => string;
  idPrefix: string;
}

function queryString(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : "";
}

function readPagination(req: Request) {
  const page = clamp(Number(queryString(req, "page") || 1) || 1, 1, 1_000_000);
  const pageSize = clamp(Number(queryString(req, "pageSize") || 12) || 12, 1, 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function buildFilters(config: CrudConfig, req: Request) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const published = queryString(req, "published");
  if (published === "true" || published === "false") {
    clauses.push("published = ?");
    params.push(published === "true" ? 1 : 0);
  }

  for (const [param, column] of Object.entries(config.filters || {})) {
    const value = queryString(req, param);
    if (value) {
      clauses.push(`${column} = ?`);
      params.push(value);
    }
  }

  const q = queryString(req, "q").trim();
  if (q && config.searchColumns.length > 0) {
    const term = `%${escapeLike(q)}%`;
    clauses.push(
      `(${config.searchColumns.map((column) => `${column} LIKE ? ESCAPE '\\'`).join(" OR ")})`
    );
    for (let index = 0; index < config.searchColumns.length; index += 1) {
      params.push(term);
    }
  }

  return { clauses, params };
}

export function createCrudRouter(config: CrudConfig) {
  const router = Router();
  const orderBy = config.orderBy || "sort_order ASC, updated_at DESC";

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const { page, pageSize, offset } = readPagination(req);
      const { clauses, params } = buildFilters(config, req);
      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

      const total = (
        db.prepare(`SELECT COUNT(*) AS count FROM ${config.table} ${where}`).get(...params) as {
          count: number;
        }
      ).count;

      const rows = db
        .prepare(`SELECT * FROM ${config.table} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
        .all(...params, pageSize, offset) as any[];

      res.json({
        items: rows.map(config.serialize),
        total,
        page,
        pageSize,
        pages: Math.max(1, Math.ceil(total / pageSize))
      });
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const parsed = config.createSchema.parse(req.body);
      const id = randomId(config.idPrefix);
      const prepared = config.prepare(parsed, { mode: "create", id });
      const row = {
        id,
        ...prepared,
        created_at: now(),
        updated_at: now()
      };
      const columns = Object.keys(row);
      db.prepare(
        `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${columns
          .map(() => "?")
          .join(", ")})`
      ).run(...columns.map((column) => row[column]));
      const created = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(id);
      logActivity({
        userId: req.adminUser?.id,
        userName: req.adminUser?.name,
        action: "create",
        resourceType: config.key,
        resourceId: id,
        title: config.label(created)
      });
      res.status(201).json(config.serialize(created));
    })
  );

  router.post(
    "/reorder",
    asyncHandler(async (req, res) => {
      const input = reorderInput.parse(req.body);
      const update = db.prepare(
        `UPDATE ${config.table} SET sort_order = ?, updated_at = ? WHERE id = ?`
      );
      const transaction = db.transaction(() => {
        input.ids.forEach((id, index) => update.run(index * 10, now(), id));
      });
      transaction();
      logActivity({
        userId: req.adminUser?.id,
        userName: req.adminUser?.name,
        action: "reorder",
        resourceType: config.key,
        title: `${input.ids.length} registos reordenados`
      });
      res.json({ ok: true });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const row = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(req.params.id);
      if (!row) throw new ApiError(404, "Registo não encontrado.", "NOT_FOUND");
      res.json(config.serialize(row));
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const existing = db
        .prepare(`SELECT * FROM ${config.table} WHERE id = ?`)
        .get(req.params.id) as Record<string, unknown> | undefined;
      if (!existing) throw new ApiError(404, "Registo não encontrado.", "NOT_FOUND");

      const parsed = config.updateSchema.parse(req.body);
      const prepared = config.prepare(parsed, {
        mode: "update",
        id: req.params.id,
        existing
      });
      const columns = Object.keys(prepared);
      if (columns.length === 0) {
        throw new ApiError(400, "Nenhum campo para actualizar.", "NO_FIELDS");
      }
      db.prepare(
        `UPDATE ${config.table} SET ${columns
          .map((column) => `${column} = ?`)
          .join(", ")}, updated_at = ? WHERE id = ?`
      ).run(...columns.map((column) => prepared[column]), now(), req.params.id);

      const updated = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(req.params.id);
      logActivity({
        userId: req.adminUser?.id,
        userName: req.adminUser?.name,
        action: "update",
        resourceType: config.key,
        resourceId: req.params.id,
        title: config.label(updated)
      });
      res.json(config.serialize(updated));
    })
  );

  router.delete(
    "/:id",
    requireRole("admin"),
    asyncHandler(async (req, res) => {
      const existing = db
        .prepare(`SELECT * FROM ${config.table} WHERE id = ?`)
        .get(req.params.id) as Record<string, unknown> | undefined;
      if (!existing) throw new ApiError(404, "Registo não encontrado.", "NOT_FOUND");

      db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(req.params.id);
      logActivity({
        userId: req.adminUser?.id,
        userName: req.adminUser?.name,
        action: "delete",
        resourceType: config.key,
        resourceId: req.params.id,
        title: config.label(existing)
      });
      res.status(204).end();
    })
  );

  return router;
}

export function serializeRow(
  row: any,
  jsonFields: string[],
  boolFields: string[],
  mapping: Record<string, string>
) {
  const result: Record<string, unknown> = {};
  for (const [apiKey, column] of Object.entries(mapping)) {
    const value = row[column];
    if (jsonFields.includes(column)) {
      result[apiKey] = parseJson(value, []);
    } else if (boolFields.includes(column)) {
      result[apiKey] = value === 1;
    } else {
      result[apiKey] = value;
    }
  }
  result.createdAt = row.created_at;
  result.updatedAt = row.updated_at;
  return result;
}
