import { Router } from "express";
import { db, logActivity, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, parseJson } from "../lib/util.js";
import { profileInput } from "../schemas.js";

export const profileRouter = Router();

function serializeProfile(row: any) {
  return {
    content: parseJson(row.content, {}),
    email: row.email,
    phone: row.phone,
    location: row.location,
    photoUrl: row.photo_url,
    githubUrl: row.github_url,
    linkedinUrl: row.linkedin_url,
    leetcodeUrl: row.leetcode_url,
    codeforcesUrl: row.codeforces_url,
    updatedAt: row.updated_at
  };
}

profileRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const row = db.prepare("SELECT * FROM profile WHERE id = 1").get();
    if (!row) throw new ApiError(404, "Perfil não encontrado.", "NOT_FOUND");
    res.json(serializeProfile(row));
  })
);

profileRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const input = profileInput.parse(req.body);
    db.prepare(
      `UPDATE profile SET content = ?, email = ?, phone = ?, location = ?, photo_url = ?,
       github_url = ?, linkedin_url = ?, leetcode_url = ?, codeforces_url = ?, updated_at = ?
       WHERE id = 1`
    ).run(
      JSON.stringify(input.content),
      input.email,
      input.phone,
      input.location,
      input.photoUrl,
      input.githubUrl,
      input.linkedinUrl,
      input.leetcodeUrl,
      input.codeforcesUrl,
      now()
    );
    const row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
    logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "update",
      resourceType: "profile",
      resourceId: "profile",
      title: parseJson(row?.content, {})?.pt?.name || "Perfil"
    });
    res.json(serializeProfile(row));
  })
);
