import request from "supertest";
import type { Express } from "express";
import { createApp } from "../app.js";
import { closeDb } from "../db.js";
import { seedDatabase } from "../db/seed.js";
import { TEST_ADMIN } from "./env";

export const CSRF = { "X-Requested-With": "portfolio-cms" };

let app: Express | null = null;

export async function getApp() {
  if (!app) {
    await seedDatabase();
    app = createApp();
  }
  return app;
}

/** Devolve um agente supertest já autenticado (cookie de sessão guardado). */
export async function loginAgent() {
  const agent = request.agent(await getApp());
  const response = await agent.post("/api/admin/auth/login").set(CSRF).send(TEST_ADMIN);
  if (response.status !== 200) throw new Error(`Login falhou: ${response.status} ${JSON.stringify(response.body)}`);
  return agent;
}

export { closeDb, request };

/** PNG 1x1 válido. */
export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

/** PDF mínimo. */
export const PDF_MINI = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
