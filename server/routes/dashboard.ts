import { Router } from "express";
import { db, getSettings } from "../db.js";
import { defaultSettings } from "../defaults.js";
import { asyncHandler } from "../lib/util.js";

export const dashboardRouter = Router();

const resources = [
  { key: "projects", label: "Projectos" },
  { key: "certifications", label: "Certificações" },
  { key: "experiences", label: "Experiências" },
  { key: "skills", label: "Competências" },
  { key: "education", label: "Formação académica" },
  { key: "courses", label: "Cursos" },
  { key: "publications", label: "Publicações" }
];

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const stats = resources.map((resource) => {
      const total = (
        db.prepare(`SELECT COUNT(*) AS count FROM ${resource.key}`).get() as { count: number }
      ).count;
      const published = (
        db.prepare(`SELECT COUNT(*) AS count FROM ${resource.key} WHERE published = 1`).get() as {
          count: number;
        }
      ).count;
      return {
        key: resource.key,
        label: resource.label,
        total,
        published,
        drafts: total - published
      };
    });

    const mediaCount = (
      db.prepare("SELECT COUNT(*) AS count FROM media").get() as { count: number }
    ).count;

    const recent = db
      .prepare(
        `SELECT id, user_name, action, resource_type, resource_id, title, created_at
         FROM activity_log
         WHERE resource_type != 'auth'
         ORDER BY created_at DESC LIMIT 10`
      )
      .all() as Array<Record<string, string>>;

    const settings = (getSettings() || defaultSettings) as typeof defaultSettings;

    res.json({
      stats,
      mediaCount,
      recent: recent.map((item) => ({
        id: item.id,
        userName: item.user_name,
        action: item.action,
        resourceType: item.resource_type,
        resourceId: item.resource_id,
        title: item.title,
        createdAt: item.created_at
      })),
      sitePublished: Boolean(settings.sitePublished)
    });
  })
);
