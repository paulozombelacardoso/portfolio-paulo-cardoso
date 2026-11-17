import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(currentDir, "..");

const booleanString = z
  .enum(["0", "1", "true", "false"])
  .optional()
  .transform((value) => value === "1" || value === "true");

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório."),
    DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
    DB_SSL: booleanString,

    MEDIA_DRIVER: z.enum(["cloudinary", "local", "memory"]).default("cloudinary"),
    CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
    CLOUDINARY_API_KEY: z.string().trim().optional(),
    CLOUDINARY_API_SECRET: z.string().trim().optional(),
    CLOUDINARY_FOLDER: z.string().trim().min(1).max(120).default("portfolio"),
    MEDIA_MAX_IMAGE_MB: z.coerce.number().min(0.1).max(50).default(5),
    MEDIA_MAX_VIDEO_MB: z.coerce.number().min(1).max(200).default(50),
    MEDIA_MAX_DOCUMENT_MB: z.coerce.number().min(0.1).max(100).default(10),
    MEDIA_UPLOAD_TIMEOUT_MS: z.coerce.number().int().min(1000).max(300000).default(60000),
    LOCAL_UPLOAD_DIR: z.string().trim().optional(),

    ADMIN_EMAIL: z.string().email("ADMIN_EMAIL deve ser um email válido."),
    ADMIN_PASSWORD: z.string().min(10, "ADMIN_PASSWORD deve ter pelo menos 10 caracteres."),
    ADMIN_NAME: z.string().trim().min(2).default("Paulo Cardoso"),
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(8),
    SESSION_COOKIE: z.string().trim().min(3).default("pc_admin_session"),
    COOKIE_SECURE: booleanString,
    LOGIN_RATE_LIMIT: z.coerce.number().int().min(1).max(100).default(8),
    ALLOWED_ORIGINS: z.string().optional(),
    PUBLIC_ORIGIN: z.string().trim().optional(),
    TRUST_PROXY: booleanString,
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    SEED_DEMO_CONTENT: booleanString
  })
  .superRefine((value, context) => {
    if (value.MEDIA_DRIVER === "cloudinary") {
      for (const key of [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET"
      ] as const) {
        if (!value[key]) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} é obrigatório quando MEDIA_DRIVER=cloudinary.`
          });
        }
      }
    }
    if (value.NODE_ENV === "production" && value.MEDIA_DRIVER !== "cloudinary") {
      context.addIssue({
        code: "custom",
        path: ["MEDIA_DRIVER"],
        message: "Em produção, MEDIA_DRIVER deve ser 'cloudinary'."
      });
    }
    if (value.MEDIA_DRIVER === "memory" && value.NODE_ENV !== "test") {
      context.addIssue({
        code: "custom",
        path: ["MEDIA_DRIVER"],
        message: "O driver 'memory' só é permitido em testes automatizados."
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`[config] Configuração inválida. A aplicação não pode arrancar:\n${details}`);
  throw new Error("Configuração de ambiente inválida.");
}

const env = parsed.data;
const dataDir = path.resolve(ROOT_DIR, "data");

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  logLevel: env.LOG_LEVEL,

  database: {
    url: env.DATABASE_URL,
    poolMax: env.DB_POOL_MAX,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined
  },

  storage: {
    driver: env.MEDIA_DRIVER,
    folderPrefix: env.CLOUDINARY_FOLDER,
    cloudinary:
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
        ? {
            cloudName: env.CLOUDINARY_CLOUD_NAME,
            apiKey: env.CLOUDINARY_API_KEY,
            apiSecret: env.CLOUDINARY_API_SECRET
          }
        : null,
    localDir: path.resolve(env.LOCAL_UPLOAD_DIR || path.join(dataDir, "uploads")),
    uploadTimeoutMs: env.MEDIA_UPLOAD_TIMEOUT_MS,
    limits: {
      imageBytes: Math.round(env.MEDIA_MAX_IMAGE_MB * 1024 * 1024),
      videoBytes: Math.round(env.MEDIA_MAX_VIDEO_MB * 1024 * 1024),
      documentBytes: Math.round(env.MEDIA_MAX_DOCUMENT_MB * 1024 * 1024)
    }
  },

  admin: {
    email: env.ADMIN_EMAIL.toLowerCase(),
    password: env.ADMIN_PASSWORD,
    name: env.ADMIN_NAME
  },
  session: {
    cookieName: env.SESSION_COOKIE,
    ttlHours: env.SESSION_TTL_HOURS,
    cookieSecure: env.COOKIE_SECURE ?? env.NODE_ENV === "production"
  },
  security: {
    loginRateLimit: env.LOGIN_RATE_LIMIT,
    allowedOrigins: (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    publicOrigin: env.PUBLIC_ORIGIN || ""
  },
  trustProxy: env.TRUST_PROXY ?? env.NODE_ENV === "production",
  seedDemoContent: env.SEED_DEMO_CONTENT ?? true,
  dataDir,
  distDir: path.join(ROOT_DIR, "dist"),
  publicDir: path.join(ROOT_DIR, "public")
};
