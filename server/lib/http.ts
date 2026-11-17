import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { config } from "../config.js";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Recurso não encontrado.", code: "NOT_FOUND" });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
    res.status(422).json({
      error: "Dados inválidos. Verifique os campos assinalados.",
      code: "VALIDATION_ERROR",
      issues
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  const maybeMulter = error as { code?: string; message?: string };
  if (maybeMulter?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "O ficheiro excede o tamanho máximo permitido.", code: "FILE_TOO_LARGE" });
    return;
  }
  if (maybeMulter?.code === "LIMIT_UNEXPECTED_FILE") {
    res.status(400).json({ error: "Campo de upload inválido.", code: "UPLOAD_FIELD_INVALID" });
    return;
  }

  const maybeSqlite = error as { code?: string; message?: string };
  if (maybeSqlite?.code?.startsWith("SQLITE_CONSTRAINT")) {
    res.status(409).json({ error: "Já existe um registo com estes dados.", code: "CONFLICT" });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Corpo JSON inválido.", code: "INVALID_JSON" });
    return;
  }

  if (!config.isTest) {
    console.error("[api] Unhandled error:", error);
  }
  res.status(500).json({ error: "Erro interno do servidor.", code: "INTERNAL_ERROR" });
}
