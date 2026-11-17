import fs from "node:fs";
import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { config } from "./config.js";
import { errorHandler, notFound } from "./lib/http.js";
import { asyncHandler } from "./lib/util.js";
import { requireAuth, requireCsrf } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { settingsRouter } from "./routes/settings.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { cvRouter } from "./routes/cv.js";
import { mediaRouter } from "./routes/media.js";
import { crudRouters } from "./routes/resources.js";
import { publicRouter } from "./routes/public.js";
import { openApiDocument, registerSwagger } from "./openapi.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
          "img-src": ["'self'", "data:", "blob:", "https:"],
          "media-src": ["'self'", "blob:", "https:"],
          "connect-src": ["'self'"],
          "frame-src": ["'self'", "blob:"],
          "object-src": ["'none'"],
          "base-uri": ["'self'"],
          "form-action": ["'self'", "mailto:"],
          "frame-ancestors": ["'none'"],
          "upgrade-insecure-requests": config.isProduction ? [] : null
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "same-site" }
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: config.isTest ? 10_000 : 900,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({ error: "Demasiados pedidos. Tente novamente mais tarde.", code: "RATE_LIMITED" });
      }
    })
  );

  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api/admin", requireCsrf);
  app.use("/api/admin/auth", authRouter);
  app.use("/api/admin", requireAuth);
  app.use("/api/admin/profile", profileRouter);
  app.use("/api/admin/settings", settingsRouter);
  app.use("/api/admin/dashboard", dashboardRouter);
  app.use("/api/admin/cv", cvRouter);
  app.use("/api/admin/media", mediaRouter);
  for (const [key, router] of Object.entries(crudRouters)) {
    app.use(`/api/admin/${key}`, router);
  }

  app.use("/api/public", publicRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "portfolio-cms", time: new Date().toISOString() });
  });
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/api", notFound);

  // Serve uploads only for local/memory dev driver
  if (config.storage.driver !== "cloudinary") {
    app.use(
      "/uploads",
      express.static(config.uploadDir, {
        index: false,
        dotfiles: "deny",
        maxAge: config.isProduction ? "365d" : 0,
        immutable: config.isProduction,
        setHeaders: (res) => {
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Cross-Origin-Resource-Policy", "same-site");
        }
      })
    );
  }

  if (fs.existsSync(config.distDir)) {
    app.use(express.static(config.distDir, { index: false }));
    app.use(
      asyncHandler(async (req, res, next) => {
        if (req.method !== "GET" || !req.accepts("html")) {
          next();
          return;
        }
        res.sendFile(path.join(config.distDir, "index.html"));
      })
    );
  }

  app.use(notFound);
  app.use(errorHandler);
  registerSwagger(app);
  return app;
}