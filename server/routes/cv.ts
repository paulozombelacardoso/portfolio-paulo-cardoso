import { Router } from "express";
import { clientRun, db, logActivity, now, transaction } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, onlyProvided, randomId, toBool } from "../lib/util.js";
import { requireRole } from "../middleware/auth.js";
import { cvInput } from "../schemas.js";

export const cvRouter = Router();

function serializeCv(row: any) {
  return {
    id: row.id,
    label: row.label,
    fileUrl: row.file_url,
    fileName: row.file_name,
    isActive: toBool(row.is_active),
    createdAt: row.created_at
  };
}

const findCv = (id: string) => db.prepare("SELECT * FROM cvs WHERE id = ?").get(id);

cvRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.prepare("SELECT * FROM cvs ORDER BY is_active DESC, created_at DESC").all();
    res.json({ items: rows.map(serializeCv) });
  })
);

cvRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = cvInput.parse(req.body);
    const id = randomId("cv");
    await transaction(async (client) => {
      if (input.isActive) {
        await clientRun(client, "UPDATE cvs SET is_active = FALSE WHERE is_active = TRUE");
      }
      await clientRun(
        client,
        `INSERT INTO cvs (id, label, file_url, file_name, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        input.label,
        input.fileUrl,
        input.fileName,
        input.isActive,
        now()
      );
    });
    const row = await findCv(id);
    await logActivity({
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
    const input = onlyProvided(cvInput.partial().parse(req.body), req.body);
    const existing = await findCv(String(req.params.id));
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");

    await transaction(async (client) => {
      if (input.isActive === true) {
        await clientRun(client, "UPDATE cvs SET is_active = FALSE WHERE id != ? AND is_active = TRUE", String(req.params.id));
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
        values.push(input.isActive);
      }
      if (fields.length > 0) {
        await clientRun(client, `UPDATE cvs SET ${fields.join(", ")} WHERE id = ?`, ...values, String(req.params.id));
      }
    });
    const row = await findCv(String(req.params.id));
    await logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "update",
      resourceType: "cv",
      resourceId: String(req.params.id),
      title: row?.label || "CV"
    });
    res.json(serializeCv(row));
  })
);

cvRouter.post(
  "/:id/activate",
  asyncHandler(async (req, res) => {
    const existing = await findCv(String(req.params.id));
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");
    await transaction(async (client) => {
      await clientRun(client, "UPDATE cvs SET is_active = FALSE WHERE is_active = TRUE");
      await clientRun(client, "UPDATE cvs SET is_active = TRUE WHERE id = ?", String(req.params.id));
    });
    const row = await findCv(String(req.params.id));
    await logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "publish",
      resourceType: "cv",
      resourceId: String(req.params.id),
      title: `CV activo: ${existing.label}`
    });
    res.json(serializeCv(row));
  })
);

cvRouter.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const existing = await findCv(String(req.params.id));
    if (!existing) throw new ApiError(404, "CV não encontrado.", "NOT_FOUND");

    await transaction(async (client) => {
      await clientRun(client, "DELETE FROM cvs WHERE id = ?", String(req.params.id));
      if (toBool(existing.is_active)) {
        const next = (await clientRun(client, "SELECT id FROM cvs ORDER BY created_at DESC LIMIT 1")).rows[0];
        if (next) await clientRun(client, "UPDATE cvs SET is_active = TRUE WHERE id = ?", next.id);
      }
    });
    await logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "delete",
      resourceType: "cv",
      resourceId: String(req.params.id),
      title: existing.label
    });
    res.status(204).end();
  })
);
