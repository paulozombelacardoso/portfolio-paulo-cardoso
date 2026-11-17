import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { config } from "../config.js";
import { db, logActivity, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler } from "../lib/util.js";
import { mediaUpdateInput } from "../schemas.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "application/pdf"
    ];
    if (!allowed.includes(file.mimetype)) {
      callback(new ApiError(415, "Formato não permitido. Use PNG, JPEG, WebP, GIF ou PDF.", "UNSUPPORTED_FILE"));
      return;
    }
    callback(null, true);
  }
});

const extensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf"
};

function magicMatches(mime: string, buffer: Buffer) {
  if (mime === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === "image/gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }
  if (mime === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mime === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  return false;
}

function sanitizeOriginalName(name: string) {
  return path.basename(name).replace(/[^\w.\- ()]/g, "_").slice(0, 200);
}

export const uploadRouter = Router();

uploadRouter.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "Nenhum ficheiro recebido.", "FILE_REQUIRED");
    }
    const file = req.file;
    if (!magicMatches(file.mimetype, file.buffer)) {
      throw new ApiError(415, "O conteúdo do ficheiro não corresponde ao formato indicado.", "INVALID_FILE");
    }

    const isImage = file.mimetype.startsWith("image/");
    const requestedKind = typeof req.body.kind === "string" ? req.body.kind : "";
    if (requestedKind && requestedKind !== (isImage ? "image" : "document")) {
      throw new ApiError(400, "O tipo de ficheiro não corresponde ao upload.", "KIND_MISMATCH");
    }
    if (isImage && file.size > 8 * 1024 * 1024) {
      throw new ApiError(413, "As imagens devem ter no máximo 8 MB.", "FILE_TOO_LARGE");
    }

    const date = new Date();
    const folder = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const extension = extensions[file.mimetype];
    const filename = `${Date.now()}-${randomUUID().slice(0, 10)}.${extension}`;
    const directory = path.join(config.uploadDir, folder);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), file.buffer, { mode: 0o644 });

    const url = `/uploads/${folder}/${filename}`;
    const id = `media-${randomUUID()}`;
    db.prepare(
      `INSERT INTO media (id, filename, original_name, url, mime_type, size, kind, alt_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?)`
    ).run(
      id,
      filename,
      sanitizeOriginalName(file.originalname),
      url,
      file.mimetype,
      file.size,
      isImage ? "image" : "document",
      now()
    );

    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "upload",
      resourceType: "media",
      resourceId: id,
      title: sanitizeOriginalName(file.originalname)
    });

    const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id) as any;
    res.status(201).json({
      media: {
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        url: row.url,
        mimeType: row.mime_type,
        size: row.size,
        kind: row.kind,
        altText: row.alt_text,
        createdAt: row.created_at
      }
    });
  })
);

export const mediaRouter = Router();

function serializeMedia(row: any) {
  return {
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    url: row.url,
    mimeType: row.mime_type,
    size: row.size,
    kind: row.kind,
    altText: row.alt_text,
    createdAt: row.created_at
  };
}

mediaRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 24));
    const offset = (page - 1) * pageSize;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const kind = typeof req.query.kind === "string" ? req.query.kind : "";
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (q) {
      clauses.push("(original_name LIKE ? OR alt_text LIKE ? OR url LIKE ?)");
      const term = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
      params.push(term, term, term);
    }
    if (kind === "image" || kind === "document") {
      clauses.push("kind = ?");
      params.push(kind);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const total = (
      db.prepare(`SELECT COUNT(*) AS count FROM media ${where}`).get(...params) as { count: number }
    ).count;
    const rows = db
      .prepare(`SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset) as any[];
    res.json({
      items: rows.map(serializeMedia),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    });
  })
);

function findUsage(url: string) {
  const usages: string[] = [];
  const like = `%${url}%`;
  const checks: Array<{ label: string; sql: string; params: unknown[] }> = [
    {
      label: "Perfil",
      sql: "SELECT 1 FROM profile WHERE photo_url = ? LIMIT 1",
      params: [url]
    },
    {
      label: "Projectos",
      sql: "SELECT 1 FROM projects WHERE cover_url = ? OR video_url = ? OR gallery LIKE ? LIMIT 1",
      params: [url, url, like]
    },
    {
      label: "Experiências",
      sql: "SELECT 1 FROM experiences WHERE company_logo_url = ? OR certificate_file = ? OR photos LIKE ? LIMIT 1",
      params: [url, url, like]
    },
    {
      label: "Certificações",
      sql: "SELECT 1 FROM certifications WHERE file_url = ? OR thumbnail_url = ? LIMIT 1",
      params: [url, url]
    },
    {
      label: "Formação",
      sql: "SELECT 1 FROM education WHERE logo_url = ? LIMIT 1",
      params: [url]
    },
    {
      label: "Cursos",
      sql: "SELECT 1 FROM courses WHERE file_url = ? LIMIT 1",
      params: [url]
    },
    {
      label: "Publicações",
      sql: "SELECT 1 FROM publications WHERE cover_url = ? LIMIT 1",
      params: [url]
    },
    {
      label: "CVs",
      sql: "SELECT 1 FROM cvs WHERE file_url = ? LIMIT 1",
      params: [url]
    },
    {
      label: "Configurações",
      sql: "SELECT 1 FROM settings WHERE data LIKE ? LIMIT 1",
      params: [like]
    }
  ];
  for (const check of checks) {
    const row = db.prepare(check.sql).get(...check.params);
    if (row) usages.push(check.label);
  }
  return usages;
}

mediaRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = mediaUpdateInput.parse(req.body);
    const existing = db.prepare("SELECT * FROM media WHERE id = ?").get(req.params.id);
    if (!existing) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    db.prepare("UPDATE media SET alt_text = ? WHERE id = ?").run(input.altText, req.params.id);
    const row = db.prepare("SELECT * FROM media WHERE id = ?").get(req.params.id);
    res.json(serializeMedia(row));
  })
);

mediaRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM media WHERE id = ?").get(req.params.id) as any;
    if (!existing) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");

    const usages = findUsage(existing.url);
    if (usages.length > 0 && req.query.force !== "1") {
      throw new ApiError(409, "O ficheiro está a ser utilizado.", "FILE_IN_USE", { usages });
    }

    db.prepare("DELETE FROM media WHERE id = ?").run(req.params.id);

    if (existing.url.startsWith("/uploads/")) {
      const relative = existing.url.replace(/^\/uploads\//, "");
      const absolute = path.resolve(config.uploadDir, relative);
      if (absolute.startsWith(path.resolve(config.uploadDir) + path.sep)) {
        await fs.unlink(absolute).catch(() => undefined);
      }
    }

    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "delete",
      resourceType: "media",
      resourceId: req.params.id,
      title: existing.original_name
    });
    res.status(204).end();
  })
);
