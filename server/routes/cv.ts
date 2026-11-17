import { Router } from "express";
import { db, logActivity, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, randomId } from "../lib/util.js";
import { requireRole } from "../middleware/auth.js";
import { cvInput } from "../schemas.js";

export const cvRouter = Router();

function serializeCv(row: any) {
  return {
    id: row.id,
    label: row.label,
    fileUrl: row.file_url,
    fileName: row.file_name,
    isActive: row.is_active === 1,
    createdAt: row.created_at
  };
}

cvRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM cvs ORDER BY is_active DESC, created_at DESC")
      .all() as any[];
    res.json({ items: rows.map(serializeCv) });
  })
);

cvRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = cvInput.parse(req.body);
    const id = randomId("cv");
    const transaction = db.transaction(() => {
      if (input.isActive) {
        db.prepare("UPDATE cvs SET is_active = 0").run();
      }
      db.prepare(
        `INSERT INTO cvs (id, label, file_url, file_name, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        input.label,
        input.fileUrl,
        input.fileName,
        input.isActive ? 1 : 0,
        now()
      );
    });
    transaction();
    const row = db.prepare("SELECT * FROM cvs WHERE id = ?").get(id);
    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "create",
      resourceType: "cv",
      resourceId: id,
      title: input.label
    });
    res.status(201).json(serializeCv(row));
  })
);

cvRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = cvInput.partial().parse(req.body);
    const existing = db.prepare("SELECT * FROM cvs WHERE id = ?").get(req.params.id) as any;
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");

    const transaction = db.transaction(() => {
      if (input.isActive === true) {
        db.prepare("UPDATE cvs SET is_active = 0 WHERE id != ?").run(req.params.id);
      }
      const fields: string[] = [];
      const values: unknown[] = [];
      if (input.label !== undefined) {
        fields.push("label = ?");
        values.push(input.label);
      }
      if (input.fileUrl !== undefined) {
        fields.push("file_url = ?");
        values.push(input.fileUrl);
      }
      if (input.fileName !== undefined) {
        fields.push("file_name = ?");
        values.push(input.fileName);
      }
      if (input.isActive !== undefined) {
        fields.push("is_active = ?");
        values.push(input.isActive ? 1 : 0);
      }
      if (fields.length > 0) {
        db.prepare(`UPDATE cvs SET ${fields.join(", ")} WHERE id = ?`).run(
          ...values,
          req.params.id
        );
      }
    });
    transaction();
    const row = db.prepare("SELECT * FROM cvs WHERE id = ?").get(req.params.id);
    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "update",
      resourceType: "cv",
      resourceId: req.params.id,
      title: (row as any)?.label || "CV"
    });
    res.json(serializeCv(row));
  })
);

cvRouter.post(
  "/:id/activate",
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM cvs WHERE id = ?").get(req.params.id) as any;
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");
    const transaction = db.transaction(() => {
      db.prepare("UPDATE cvs SET is_active = 0").run();
      db.prepare("UPDATE cvs SET is_active = 1 WHERE id = ?").run(req.params.id);
    });
    transaction();
    const row = db.prepare("SELECT * FROM cvs WHERE id = ?").get(req.params.id);
    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "publish",
      resourceType: "cv",
      resourceId: req.params.id,
      title: `CV activo: ${existing.label}`
    });
    res.json(serializeCv(row));
  })
);

cvRouter.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const existing = db.prepare("SELECT * FROM cvs WHERE id = ?").get(req.params.id) as any;
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM cvs WHERE id = ?").run(req.params.id);
      if (existing.is_active === 1) {
        const next = db
          .prepare("SELECT id FROM cvs ORDER BY created_at DESC LIMIT 1")
          .get() as { id: string } | undefined;
        if (next) db.prepare("UPDATE cvs SET is_active = 1 WHERE id = ?").run(next.id);
      }
    });
    transaction();
    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "delete",
      resourceType: "cv",
      resourceId: req.params.id,
      title: existing.label
    });
    res.status(204).end();
  })
);
