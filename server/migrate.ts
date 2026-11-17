import { closeDb, runMigrations, waitForDatabase } from "./db.js";

waitForDatabase()
  .then(runMigrations)
  .then(async () => {
    console.info("[migrate] Migrações aplicadas.");
    await closeDb();
  })
  .catch(async (error) => {
    console.error("[migrate] Falha:", error);
    await closeDb().catch(() => undefined);
    process.exit(1);
  });
