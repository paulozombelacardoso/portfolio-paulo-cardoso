import { Router } from "express";
import { db, getSettingsRow, logActivity, now } from "../db.js";
import { defaultSettings, defaultSections } from "../defaults.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, parseJson } from "../lib/util.js";
import { requireRole } from "../middleware/auth.js";
import { settingsInput } from "../schemas.js";

export const settingsRouter = Router();

function serializeSettings(row: any) {
  const data = parseJson(row?.data, defaultSettings);
  return {
    ...data,
    updatedAt: row?.updated_at || null
  };
}

settingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(serializeSettings(getSettingsRow()));
  })
);

settingsRouter.put(
  "/",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const input = settingsInput.parse(req.body);
    const keys = input.sections.map((section) => section.key);
    if (new Set(keys).size !== keys.length) {
      throw new ApiError(422, "Existem secções duplicadas.", "VALIDATION_ERROR");
    }
    const known = new Set(defaultSections.map((section) => section.key));
    for (const key of keys) {
      if (!known.has(key)) {
        throw new ApiError(422, `Secção desconhecida: ${key}.`, "VALIDATION_ERROR");
      }
    }
    if (keys.length !== known.size) {
      throw new ApiError(422, "Todas as secções devem estar presentes na configuração.", "VALIDATION_ERROR");
    }

    const normalized = {
      ...input,
      sections: input.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section, index) => ({ ...section, order: (index + 1) * 10 }))
    };

    if (getSettingsRow()) {
      db.prepare("UPDATE settings SET data = ?, updated_at = ? WHERE id = 1").run(
        JSON.stringify(normalized),
        now()
      );
    } else {
      db.prepare("INSERT INTO settings (id, data, updated_at) VALUES (1, ?, ?)").run(
        JSON.stringify(normalized),
        now()
      );
    }

    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "update",
      resourceType: "settings",
      resourceId: "settings",
      title: "Configurações do portfólio"
    });
    res.json(serializeSettings(getSettingsRow()));
  })
);
