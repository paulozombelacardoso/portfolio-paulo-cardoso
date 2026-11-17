import { Router, type Request } from "express";
import multer from "multer";
import { config } from "../config.js";
import { db } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, clamp, escapeLike } from "../lib/util.js";
import { requireRole } from "../middleware/auth.js";
import { MediaService, serializeMedia } from "../media/media.service.js";
import { createStorageService } from "../media/storage.factory.js";
import { assertMediaFolder, isMediaFolder, validateUpload } from "../media/validation.js";
import { mediaUpdateInput } from "../schemas.js";

export const mediaRouter = Router();

// Lazily created so that the app can boot even when storage is misconfigured;
// the error surfaces on the first media operation instead.
let service: MediaService | null = null;
function mediaService() {
  service ??= new MediaService(createStorageService());
  return service;
}

const maxBytes = Math.max(
  config.storage.limits.imageBytes,
  config.storage.limits.videoBytes,
  config.storage.limits.documentBytes
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1, fields: 10 }
});

function actorOf(req: Request) {
  return { id: req.adminUser?.id, name: req.adminUser?.name };
}

function bodyString(req: Request, ...keys: string[]) {
  for (const key of keys) {
    const value = req.body?.[key];
    if (typeof value === "string") return value;
  }
  return "";
}

async function readUpload(req: Request) {
  if (!req.file) {
    throw new ApiError(400, "Nenhum ficheiro recebido (campo 'file').", "FILE_REQUIRED");
  }
  return validateUpload({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    declaredMimeType: req.file.mimetype
  });
}

/** GET /api/admin/media — list with pagination and filters (q, kind, folder). */
mediaRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = clamp(Number(req.query.page) || 1, 1, 1_000_000);
    const pageSize = clamp(Number(req.query.pageSize) || 24, 1, 100);
    const offset = (page - 1) * pageSize;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const kind = typeof req.query.kind === "string" ? req.query.kind : "";
    const folder = typeof req.query.folder === "string" ? req.query.folder : "";

    const clauses: string[] = [];
    const params: unknown[] = [];
    if (q) {
      const term = `%${escapeLike(q)}%`;
      clauses.push(`(original_name ILIKE ? ESCAPE '\\' OR alt_text ILIKE ? ESCAPE '\\')`);
      params.push(term, term);
    }
    if (kind) {
      clauses.push("kind = ?");
      params.push(kind);
    }
    if (folder) {
      clauses.push("folder = ?");
      params.push(folder);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const total =
      (await db.prepare(`SELECT COUNT(*) AS count FROM media ${where}`).get<{ count: number }>(...params))
        ?.count ?? 0;
    const rows = await db
      .prepare(`SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset);

    res.json({
      items: rows.map(serializeMedia),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    });
  })
);

/** POST /api/admin/media/upload — multipart: file, folder, altText. */
mediaRouter.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const folder = assertMediaFolder(bodyString(req, "folder") || "projects");
    const altText = bodyString(req, "altText", "alt_text");
    const validated = await readUpload(req);
    const media = await mediaService().upload(validated, folder, altText, actorOf(req));
    res.status(201).json(media);
  })
);

/** POST /api/admin/media/:id/replace (alias: /replace/:id) — replace the file, keeping references. */
const replaceHandler = asyncHandler(async (req, res) => {
  const existing = await mediaService().findById(String(req.params.id));
  if (!existing) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
  const requested = bodyString(req, "folder");
  const derived = existing.folder.split("/").pop();
  const folder = requested
    ? assertMediaFolder(requested)
    : isMediaFolder(derived)
      ? derived
      : existing.kind === "document"
        ? "documents"
        : "projects";
  const altText = bodyString(req, "altText", "alt_text") || existing.altText;
  const validated = await readUpload(req);
  const media = await mediaService().replace(String(req.params.id), validated, folder, altText, actorOf(req));
  res.json(media);
});
mediaRouter.post("/:id/replace", upload.single("file"), replaceHandler);
mediaRouter.post("/replace/:id", upload.single("file"), replaceHandler);

/** GET /api/admin/media/:id/usage — where the file is referenced. */
mediaRouter.get(
  "/:id/usage",
  asyncHandler(async (req, res) => {
    const media = await mediaService().findById(String(req.params.id));
    if (!media) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    res.json({ usages: await mediaService().findUsage(media.secureUrl) });
  })
);

mediaRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const media = await mediaService().findById(String(req.params.id));
    if (!media) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    res.json(media);
  })
);

mediaRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = mediaUpdateInput.parse(req.body);
    res.json(await mediaService().updateAltText(String(req.params.id), input.altText));
  })
);

mediaRouter.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await mediaService().delete(String(req.params.id), actorOf(req));
    res.status(204).end();
  })
);
