import { config } from "./config.js";
import { createApp } from "./app.js";
import { closeDb, pruneExpiredSessions, runMigrations, waitForDatabase } from "./db.js";
import { seedDatabase } from "./db/seed.js";
import { logger } from "./lib/logger.js";

async function main() {
  await waitForDatabase();
  await runMigrations();
  // Idempotent: creates the admin user and demo content only when the tables are empty.
  await seedDatabase();
  await pruneExpiredSessions();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info("Portfolio CMS API a correr.", {
      url: `http://localhost:${config.port}`,
      docs: `http://localhost:${config.port}/api/docs`,
      env: config.env,
      media: config.storage.driver
    });
  });

  const shutdown = (signal: string) => {
    logger.info("A encerrar o servidor.", { signal });
    server.close(() => {
      closeDb()
        .catch(() => undefined)
        .finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// Regista sempre a causa antes de o processo terminar (facilita diagnosticar quedas da API).
process.on("unhandledRejection", (reason) => {
  logger.error("Promise rejeitada sem tratamento.", { error: reason });
});
process.on("uncaughtException", (error) => {
  logger.error("Excepção não tratada; a terminar.", { error });
  process.exit(1);
});
process.on("exit", (code) => {
  if (code !== 0) console.error(`[api] processo terminou com código ${code}`);
});

main().catch((error) => {
  logger.error("Falha ao arrancar o servidor.", { error });
  process.exit(1);
});
