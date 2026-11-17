import { Router, type Request, type Response } from "express";
import path from "node:path";
import { config } from "../config.js";
import { db, execute, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, parseJson } from "../lib/util.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createStorageService } from "../media/storage.factory.js";
import { MediaService } from "../media/media.service.js";
import type { StoredAsset } from "../media/types.js";
import { fileTypeFromBuffer } from "file-type";

export const mediaRouter = Router();

mediaRouter.use(requireAuth);

/**
 * Allowed MIME types and their metadata.
 */
const allowedMimes = new Map([
  ["image/png", { kind: "image", extension: "png" }],
  ["image/jpeg", { kind: "image", extension: "jpg" }],
  ["image/webp", { kind: "image", extension: "webp" }],
  ["video/mp4", { kind: "video", extension: "mp4" }],
  ["video/webm", { kind: "video", extension: "webm" }],
  ["application/pdf", { kind: "document", extension: "pdf" }]
]);

/**
 * Allowed file extensions mapped to their MIME types.
 */
const allowedExtensions = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".pdf", "application/pdf"]
]);

/**
 * GET /api/admin/media
 * List all media assets with pagination and filtering.
 */
mediaRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 24));
    const offset = (page - 1) * pageSize;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const kind = typeof req.query.kind === "string" ? req.query.kind : "";
    const folder = typeof req.query.folder === "string" ? req.query.folder : "";
    const published = typeof req.query.published === "string" ? req.query.published : "";

    const clauses: string[] = [];
    const params: unknown[] = [];

    if (q) {
      clauses.push(`(original_name LIKE ? OR alt_text LIKE ?)`);
      const term = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
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
    if (published === "true" || published === "false") {
      clauses.push("published = ?");
      params.push(published === "true" ? 1 : 0);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const total = (
      await db.query(`SELECT COUNT(*) AS count FROM media ${where}`, params)
    ).rows[0].count;

    const rows = (
      await db.query(`SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset])
    ).rows;

    res.json({
      items: rows.map((r: any) => ({
        id: r.id,
        publicId: r.public_id,
        secureUrl: r.secure_url,
        resourceType: r.resource_type,
        format: r.format,
        bytes: Number(r.bytes),
        width: r.width,
        height: r.height,
        duration: r.duration,
        folder: r.folder,
        originalName: r.original_name,
        mimeType: r.mime_type,
        kind: r.kind,
        altText: r.alt_text,
        transformations: typeof r.transformations === "string" ? JSON.parse(r.transformations) : (r.transformations || {}),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      })),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    });
  })
);

/**
 * GET /api/admin/media/:id
 * Get media asset by ID.
 */
mediaRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = (
      await db.query(`SELECT * FROM media WHERE id = $1`, [req.params.id])
    ).rows[0];

    if (!row) {
      throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    }

    res.json({
      id: row.id,
      publicId: row.public_id,
      secureUrl: row.secure_url,
      resourceType: row.resource_type,
      format: row.format,
      bytes: Number(row.bytes),
      width: row.width,
      height: row.height,
      duration: row.duration,
      folder: row.folder,
      originalName: row.original_name,
      mimeType: row.mime_type,
      kind: row.kind,
      altText: row.alt_text,
      transformations: typeof row.transformations === "string" ? JSON.parse(row.transformations) : (row.transformations || {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  })
);

/**
 * POST /api/admin/media/upload
 * Upload a new media file to Cloudinary.
 * Expects: multipart/form-data with file field, folder (optional), alt_text (optional)
 */
mediaRouter.post(
  "/upload",
  asyncHandler(async (req: Request, res: Response) => {
    const folder = (req.body.folder || "projects") as string;
    if (!["profile", "projects", "certifications", "experiences", "education", "documents", "publications"].includes(folder)) {
      throw new ApiError(400, "Pasta de destino inválida.", "INVALID_FOLDER");
    }

    const altText = (req.body.alt_text || "").slice(0, 300) as string;

    if (!req.file) {
      throw new ApiError(400, "Nenhum ficheiro recebido.", "FILE_REQUIRED");
    }

    const storage = createStorageService();
    const validated = await validateUpload(req.file);

    const asset = await storage.upload({ ...validated, folder });

    const id = randomId("media");
    await db.query(
      `INSERT INTO media
       (id, public_id, secure_url, resource_type, format, bytes, width, height, duration, folder,
        original_name, mime_type, kind, alt_text, transformations, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)`,
      [id, asset.publicId, asset.secureUrl, asset.resourceType, asset.format, asset.bytes, asset.width, asset.height, asset.duration, folder, validated.originalName, validated.mimeType, validated.kind, altText, JSON.stringify(asset.transformations)]
    );

    await execute(
      `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
       VALUES ($1, $2, $3, 'upload', 'media', $4, $5, $6)`,
      [randomUUID(), req.adminUser?.id || null, req.adminUser?.name || "", asset.publicId, validated.originalName, now()]
    );

    res.status(201).json({
      id,
      ...asset,
      altText,
      createdAt: new Date().toISOString()
    });
  })
);

/**
 * POST /api/admin/media/replace/:id
 * Replace an existing media asset.
 */
mediaRouter.post(
  "/replace/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const mediaId = req.params.id;
    const folder = (req.body.folder || "projects") as string;
    if (!["profile", "projects", "certifications", "experiences", "education", "documents", "publications"].includes(folder)) {
      throw new ApiError(400, "Pasta de destino inválida.", "INVALID_FOLDER");
    }

    const altText = (req.body.alt_text || "").slice(0, 300) as string;

    const existing = await db.query(`SELECT * FROM media WHERE id = $1`, [mediaId]);
    if (existing.rows.length === 0) {
      throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    }

    const storage = createStorageService();
    const validated = await validateUpload(req.file!);
    const asset = await storage.upload({ ...validated, folder });

    await db.query(
      `UPDATE media SET
       public_id = $1, secure_url = $2, resource_type = $3, format = $4, bytes = $5,
       width = $6, height = $7, duration = $8, folder = $9, original_name = $10,
       mime_type = $11, kind = $12, alt_text = $13, transformations = $14, updated_at = NOW()
       WHERE id = $16`,
      [asset.publicId, asset.secureUrl, asset.resourceType, asset.format, asset.bytes, asset.width, asset.height, asset.duration, folder, validated.originalName, validated.mimeType, validated.kind, altText, JSON.stringify(asset.transformations), mediaId]
    );

    // Compensate: delete old Cloudinary asset if DB update succeeded
    await new MediaService(createStorageService()).delete(existing.rows[0].public_id, existing.rows[0].resource_type);

    res.json({
      id: mediaId,
      ...asset,
      altText,
      updatedAt: new Date().toISOString()
    });
  })
);

/**
 * DELETE /api/admin/media/:id
 * Delete a media asset (only when not referenced).
 */
mediaRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const row = (
      await db.query(`SELECT * FROM media WHERE id = $1`, [req.params.id])
    ).rows[0];

    if (!row) {
      throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    }

    // Check usage
    const usageRow = await db.query(
      `SELECT 1 FROM profile WHERE photo_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM projects WHERE cover_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM projects WHERE video_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM experiences WHERE company_logo_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM experiences WHERE certificate_file = $1 LIMIT 1 UNION ALL SELECT 1 FROM certifications WHERE file_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM certifications WHERE thumbnail_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM education WHERE logo_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM courses WHERE file_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM publications WHERE cover_url = $1 LIMIT 1 UNION ALL SELECT 1 FROM cvs WHERE file_url = $1 LIMIT 1`,
      [row.secure_url]
    );

    if (usageRow.rowCount > 0) {
      throw new ApiError(409, "O ficheiro está a ser utilizado e não pode ser eliminado.", "FILE_IN_USE");
    }

    await db.query(`DELETE FROM media WHERE id = $1`, [req.params.id]);

    // Compensate: attempt Cloudinary deletion
    try {
      await new MediaService(createStorageService()).delete(row.public_id, row.resource_type);
    } catch (error) {
      // Enqueue cleanup job
      await db.query(
        `INSERT INTO media_cleanup_jobs (id, public_id, resource_type, reason, attempts, last_error, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 0, NULL, NOW(), NOW())`,
        [randomUUID(), row.public_id, row.resource_type, `Cloudinary deletion failed: ${(error as Error).message}`]
      );
    }

    await execute(
      `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
       VALUES ($1, $2, $3, 'delete', 'media', $4, $5, $6)`,
      [randomUUID(), req.adminUser?.id || null, req.adminUser?.name || "", req.params.id, row.original_name, now()]
    );

    res.status(204).end();
  })
)

/**
 * Validate an uploaded file using magic-byte detection, MIME, extension and size checks.
 */
function validateUpload(input: any): Promise<{ buffer: Buffer; originalName: string; mimeType: string; extension: string; kind: string; size: number }> {
  return new Promise((resolve, reject) => {
    fileTypeFromBuffer(input.buffer, (err: any, detected: any) => {
      if (err || !detected) {
        reject(new ApiError(415, "Não foi possível identificar o formato real do ficheiro.", "UNVERIFIABLE_FILE"));
        return;
      }

      const declaredMime = input.declaredMimeType.toLowerCase();
      const resolvedMime = allowedMimes.has(declaredMime) ? declaredMime : allowedMimes.get(detected.mime) || detected.mime;

      if (!allowedMimes.has(resolvedMime)) {
        reject(new ApiError(415, "Formato não permitido. Formatos aceites: JPG, PNG, WebP, MP4, WebM e PDF.", "UNSUPPORTED_FILE"));
        return;
      }

      if (declaredMime !== resolvedMime && declaredMime !== (allowedMimes.get(detected.mime) || detected.mime)) {
        reject(new ApiError(415, "O tipo MIME declarado não corresponde ao conteúdo do ficheiro.", "MIME_MISMATCH"));
        return;
      }

      const originalExtension = path.extname(input.originalName || "").toLowerCase();
      const expectedExtension = allowedMimes.get(resolvedMime)!.extension;
      if (!allowedExtensions.has(originalExtension) || allowedExtensions.get(originalExtension) !== resolvedMime) {
        reject(new ApiError(415, "A extensão do ficheiro não corresponde ao formato detectado.", "EXTENSION_MISMATCH"));
        return;
      }

      const kind = allowedMimes.get(resolvedMime)!.kind;
      const sizeLimit = config.storage.limits[kind === "image" ? "imageBytes" : kind === "video" ? "videoBytes" : "documentBytes"];
      if (input.buffer.length > sizeLimit) {
        const label = kind === "image" ? "5 MB" : kind === "video" ? "50 MB" : "10 MB";
        reject(new ApiError(413, `O ficheiro excede o limite de ${label} para ${kind === "image" ? "imagens" : kind === "video" ? "vídeos" : "documentos"}.`, "FILE_TOO_LARGE"));
        return;
      }

      resolve({
        buffer: input.buffer,
        originalName: input.originalName,
        mimeType: resolvedMime,
        extension: expectedExtension,
        kind,
        size: input.buffer.length
      });
    });
  });
}

/**
 * Re-export the router.
 */
export default mediaRouter;