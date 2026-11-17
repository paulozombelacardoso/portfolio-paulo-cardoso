import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { config } from "../config.js";
import { db, logActivity, now } from "../db.js";
import { ApiError } from "../lib/http.js";
import { asyncHandler, toBool } from "../lib/util.js";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  hashPassword,
  requireAuth,
  setSessionCookie,
  verifyPassword
} from "../middleware/auth.js";
import { loginInput, passwordInput } from "../schemas.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isTest ? 100 : config.security.loginRateLimit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    res.status(429).json({
      error: "Demasiadas tentativas de início de sessão. Tente novamente mais tarde.",
      code: "RATE_LIMITED"
    });
  }
});

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const input = loginInput.parse(req.body);
    const email = input.email.toLowerCase();
    const row = (await db
      .prepare(
        `SELECT id, email, name, role, password_hash, is_active
         FROM admin_users WHERE lower(email) = ?`
      )
      .get(email)) as
      | {
          id: string;
          email: string;
          name: string;
          role: "admin" | "editor";
          password_hash: string;
          is_active: boolean;
        }
      | undefined;

    const valid = await verifyPassword(input.password, row?.password_hash);
    if (!row || !valid || !toBool(row.is_active)) {
      throw new ApiError(401, "Credenciais inválidas.", "INVALID_CREDENTIALS");
    }

    const token = await createSession(row.id, req);
    setSessionCookie(res, token);
    await db.prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(
      now(),
      now(),
      row.id
    );
    await logActivity({
      userId: row.id,
      userName: row.name,
      action: "login",
      resourceType: "auth",
      resourceId: row.id
    });

    res.json({
      user: { id: row.id, email: row.email, name: row.name, role: row.role }
    });
  })
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[config.session.cookieName];
    await destroySession(token);
    clearSessionCookie(res);
    await logActivity({
      userId: req.adminUser?.id,
      userName: req.adminUser?.name,
      action: "logout",
      resourceType: "auth",
      resourceId: req.adminUser?.id
    });
    res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.adminUser });
  })
);

authRouter.put(
  "/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = passwordInput.parse(req.body);
    const row = (await db
      .prepare("SELECT password_hash FROM admin_users WHERE id = ?")
      .get(req.adminUser!.id)) as { password_hash: string } | undefined;
    if (!row || !(await verifyPassword(input.currentPassword, row.password_hash))) {
      throw new ApiError(400, "A palavra-passe actual está incorrecta.", "INVALID_PASSWORD");
    }

    const hash = await hashPassword(input.newPassword);
    await db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
      hash,
      now(),
      req.adminUser!.id
    );
    // Revoke all other sessions after a password change.
    await db.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(
      req.adminUser!.id,
      req.sessionId
    );
    await logActivity({
      userId: req.adminUser!.id,
      userName: req.adminUser!.name,
      action: "update",
      resourceType: "auth",
      resourceId: req.adminUser!.id,
      title: "Palavra-passe alterada"
    });
    res.json({ ok: true });
  })
);
