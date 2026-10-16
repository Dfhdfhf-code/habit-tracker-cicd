/**
 * Утилита для преобразования ошибок Supabase в понятные сообщения.
 */

/** Типы ошибок, с которыми работаем. */
export type AppErrorType =
  | "network"
  | "auth"
  | "permission"
  | "validation"
  | "unknown";

export interface AppError {
  type: AppErrorType;
  message: string;
  original?: unknown;
}

/**
 * Преобразует ошибку Supabase в объект AppError.
 */
export function parseSupabaseError(error: unknown): AppError {
  // Строка — простая ошибка
  if (typeof error === "string") {
    return { type: "unknown", message: error, original: error };
  }

  // Объект с message
  if (error && typeof error === "object") {
    const err = error as { message?: string; code?: string; status?: number };
    const message = err.message ?? "Неизвестная ошибка";
    const code = err.code ?? "";
    const status = err.status ?? 0;

    // Сетевые ошибки
    if (
      message.includes("Failed to fetch") ||
      message.includes("NetworkError") ||
      status >= 500
    ) {
      return {
        type: "network",
        message: "Ошибка соединения. Проверьте интернет.",
        original: error,
      };
    }

    // Ошибки доступа
    if (status === 403 || code === "42501") {
      return {
        type: "permission",
        message: "Нет доступа. Войдите в аккаунт заново.",
        original: error,
      };
    }

    // Ошибки авторизации
    if (status === 401 || code === "invalid_credentials") {
      return {
        type: "auth",
        message: "Неверный email или пароль.",
        original: error,
      };
    }

    // Rate limit
    if (message.includes("rate limit") || message.includes("only request")) {
      return {
        type: "auth",
        message: "Слишком много попыток. Подождите минуту.",
        original: error,
      };
    }

    // Email not confirmed
    if (message.includes("Email not confirmed")) {
      return {
        type: "auth",
        message: "Подтвердите email перед входом.",
        original: error,
      };
    }

    // User already registered
    if (message.includes("already registered")) {
      return {
        type: "auth",
        message: "Этот email уже зарегистрирован. Войдите.",
        original: error,
      };
    }

    // Валидация
    if (code === "23505" || message.includes("duplicate key")) {
      return {
        type: "validation",
        message: "Такая запись уже существует.",
        original: error,
      };
    }

    if (code === "23503") {
      return {
        type: "validation",
        message: "Связанная запись не найдена.",
        original: error,
      };
    }

    return { type: "unknown", message, original: error };
  }

  return {
    type: "unknown",
    message: "Произошла неизвестная ошибка.",
    original: error,
  };
}