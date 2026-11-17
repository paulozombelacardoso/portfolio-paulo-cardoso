import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

const apiTarget = process.env.VITE_API_TARGET || "http://localhost:4000";

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: false },
      "/uploads": { target: apiTarget, changeOrigin: false }
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/*.test.ts"],
    globalSetup: ["server/test/global-setup.ts"],
    setupFiles: ["server/test/setup.ts"],
    // Os ficheiros partilham a mesma base de dados de teste.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8"
    }
  }
});
