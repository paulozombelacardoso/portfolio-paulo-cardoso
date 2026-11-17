import { randomBytes, randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function randomId(prefix = "") {
  const value = randomUUID().replace(/-/g, "").slice(0, 18);
  return prefix ? `${prefix}-${value}` : value;
}

export function shortToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  // JSONB columns are already parsed by the pg driver.
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toBool(value: unknown) {
  return value === 1 || value === true || value === "1" || value === "true" || value === "t";
}

export function toDbBool(value: unknown) {
  return Boolean(value);
}

export function cleanNullable(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export function nowIso() {
  return new Date().toISOString();
}

export async function ensureUniqueSlug(
  baseValue: string,
  exists: (slug: string) => Promise<boolean>,
  fallbackPrefix = "item"
) {
  const base = slugify(baseValue) || fallbackPrefix;
  let candidate = base;
  let index = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

export function formatDatePt(value?: string | null, lang: "pt" | "en" = "pt") {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT", {
    month: "2-digit",
    year: "numeric"
  });
}

export function formatPeriod(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean,
  override?: string,
  lang: "pt" | "en" = "pt"
) {
  if (override) return override;
  const start = formatDatePt(startDate, lang);
  const end = isCurrent ? (lang === "en" ? "Present" : "Presente") : formatDatePt(endDate, lang);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

export function pickLocale<T extends Record<string, unknown>>(content: any, lang: "pt" | "en") {
  const primary = (content?.[lang] || {}) as Partial<T>;
  const fallback = lang === "en" ? ((content?.pt || {}) as Partial<T>) : {};
  return {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(primary).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    )
  } as T;
}

export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function localizedValue(value: unknown, lang: "pt" | "en") {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return String(value || "");
    }
  }
  if (!parsed || typeof parsed !== "object") return String(parsed || "");
  const record = parsed as Record<string, unknown>;
  return String(record[lang] || record.pt || "");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Zod 4 aplica `.default()` mesmo dentro de `.partial()`. Num PATCH isso repunha
 * campos omitidos nos valores por omissão; mantemos só as chaves enviadas.
 */
export function onlyProvided<T extends Record<string, unknown>>(parsed: T, body: unknown): Partial<T> {
  const provided = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return Object.fromEntries(Object.entries(parsed).filter(([key]) => key in provided)) as Partial<T>;
}
