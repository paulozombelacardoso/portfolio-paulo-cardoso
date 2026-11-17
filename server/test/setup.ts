import { TEST_ADMIN, TEST_DATABASE_URL } from "./env";

// Tem de correr antes de server/config.ts ser importado.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: TEST_DATABASE_URL,
  MEDIA_DRIVER: "memory",
  ADMIN_EMAIL: TEST_ADMIN.email,
  ADMIN_PASSWORD: TEST_ADMIN.password,
  ADMIN_NAME: "Test Admin",
  ALLOWED_ORIGINS: "http://localhost:5174",
  COOKIE_SECURE: "false",
  SEED_DEMO_CONTENT: "true",
  LOG_LEVEL: "error"
});
