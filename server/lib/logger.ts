import { config } from "../config.js";

type Level = "debug" | "info" | "warn" | "error";
const priorities: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const sensitiveKeys = /(secret|password|token|api[_-]?key|authorization|cookie)/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[depth-limit]";
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: config.isProduction ? undefined : value.stack };
  }
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sensitiveKeys.test(key) ? "[redacted]" : sanitize(entry, depth + 1)
      ])
    );
  }
  return value;
}

function write(level: Level, message: string, context?: Record<string, unknown>) {
  if (priorities[level] < priorities[config.logLevel]) return;
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context: sanitize(context) } : {})
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context)
};
