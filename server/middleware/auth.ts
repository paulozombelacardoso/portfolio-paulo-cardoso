import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { db, now, pruneExpiredSessions } from "../db.js";
import { shortToken, toBool } from "../lib/util.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminUser?: AuthUser;
      sessionId?: string;
    }
  }
}

const dummyHash = bcrypt.hashSync("not-a-real-password", 12);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) {
    await bcrypt.compare(password, dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(res: Response, token: string) {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/",
    maxAge: config.sessionTtlHours * 60 * 60 * 1000
  };
  res.cookie(config.sessionCookie, token, options);
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(config.sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/"
  });
}

export function createSession(userId: string, req: Request) {
  pruneExpiredSessions();

  const token = shortToken(40);
  const expiresAt = new Date(Date.now() + config.sessionTtlHours * 60 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    shortToken(12),
    userId,
    hashToken(token),
    req.ip || "",
    String(req.get("user-agent") || "").slice(0, 300),
    expiresAt,
    now()
  );

  // Keep a bounded number of active sessions per account.
  db.prepare(
    `DELETE FROM sessions
     WHERE user_id = ? AND id NOT IN (
       SELECT id FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
     )`
  ).run(userId, userId);

  return token;
}

export function destroySession(token: string | undefined) {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[config.sessionCookie];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "Sessão inválida ou expirada.", code: "UNAUTHENTICATED" });
    return;
  }

  const row = db
    .prepare(
      `SELECT s.id AS session_id, s.expires_at, u.id, u.email, u.name, u.role, u.is_active
       FROM sessions s JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(hashToken(token)) as
    | {
        session_id: string;
        expires_at: string;
        id: string;
        email: string;
        name: string;
        role: "admin" | "editor";
        is_active: number;
      }
    | undefined;

  if (!row || new Date(row.expires_at).getTime() <= Date.now() || !toBool(row.is_active)) {
    if (row) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(row.session_id);
    }
    clearSessionCookie(res);
    res.status(401).json({ error: "Sessão inválida ou expirada.", code: "UNAUTHENTICATED" });
    return;
  }

  req.adminUser = { id: row.id, email: row.email, name: row.name, role: row.role };
  req.sessionId = row.session_id;
  next();
}

export function requireRole(...roles: Array<AuthUser["role"]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      res.status(401).json({ error: "Não autenticado.", code: "UNAUTHENTICATED" });
      return;
    }
    if (!roles.includes(req.adminUser.role)) {
      res.status(403).json({ error: "Sem permissão para esta operação.", code: "FORBIDDEN" });
      return;
    }
    next();
  };
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  if (req.get("x-requested-with") !== "portfolio-cms") {
    res.status(403).json({ error: "Pedido não autorizado.", code: "CSRF_REJECTED" });
    return;
  }

  const origin = req.get("origin");
  if (origin && config.allowedOrigins.length > 0 && !config.allowedOrigins.includes(origin)) {
    res.status(403).json({ error: "Origem não autorizada.", code: "ORIGIN_REJECTED" });
    return;
  }

  next();
}
