/**
 * Утилита структурированного логирования.
 * Формат: JSON с уровнем, сообщением, контекстом, временем.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

/**
 * Создаёт структурированную запись лога.
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };
}

/**
 * Отправляет лог в console (в production — в Sentry/Supabase Logs).
 */
function sendLog(entry: LogEntry) {
  const json = JSON.stringify(entry);

  switch (entry.level) {
    case "info":
      console.info(json);
      break;
    case "warn":
      console.warn(json);
      break;
    case "error":
      console.error(json);
      break;
  }

  // В production — отправить в Supabase Logs / Sentry
  // if (import.meta.env.PROD) {
  //   fetch("/api/logs", { method: "POST", body: json });
  // }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    sendLog(createLogEntry("info", message, context));
  },

  warn(message: string, context?: Record<string, unknown>) {
    sendLog(createLogEntry("warn", message, context));
  },

  error(message: string, context?: Record<string, unknown>) {
    sendLog(createLogEntry("error", message, context));
  },
};