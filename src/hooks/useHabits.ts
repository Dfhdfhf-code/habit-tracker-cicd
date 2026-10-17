import { useState, useEffect, useCallback } from "react";
import type { Habit } from "../types/habit";
import { supabase } from "../lib/supabase";
import { parseSupabaseError, type AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export interface UseHabitsReturn {
  habits: Habit[];
  loading: boolean;
  error: AppError | null;
  clearError: () => void;
  addHabit: (name: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
}

interface HabitRow {
  id: string;
  name: string;
  created_at: string;
}

interface LogRow {
  habit_id: string;
  completed: boolean;
}

/**
 * Хук управления привычками через Supabase.
 * Загружает привычки + отметки за сегодня. Обрабатывает ошибки.
 */
export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("id, name, created_at")
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (habitsError) {
      setError(parseSupabaseError(habitsError));
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: logsData, error: logsError } = await supabase
      .from("habit_logs")
      .select("habit_id, completed")
      .eq("log_date", today);

    if (logsError) {
      logger.warn("Ошибка загрузки логов", {
        error: logsError.message,
        today,
      });
    }

    const logsMap = new Map<string, boolean>();
    (logsData as LogRow[] | null)?.forEach((log) => {
      logsMap.set(log.habit_id, log.completed);
    });

    const mapped: Habit[] = (habitsData as HabitRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      completed: logsMap.get(row.id) ?? false,
      createdAt: row.created_at,
    }));

    setHabits(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const addHabit = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError({
          type: "validation",
          message: "Название не может быть пустым.",
        });
        return;
      }

      setError(null);
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError({
          type: "auth",
          message: "Вы не авторизованы. Войдите в аккаунт.",
        });
        logger.error("Не удалось получить пользователя", {
          code: userError?.code,
          message: userError?.message,
        });
        return;
      }

      const { error: insertError } = await supabase.from("habits").insert({
        user_id: userData.user.id,
        name: trimmed,
      });

      if (insertError) {
        logger.error("Ошибка создания привычки", {
          habit_name: trimmed,
          code: insertError.code,
          message: insertError.message,
        });
        setError(parseSupabaseError(insertError));
        return;
      }

      await loadHabits();
    },
    [loadHabits]
  );

  const removeHabit = useCallback(
    async (id: string) => {
      setError(null);

      // A01: defense-in-depth — проверяем owner на клиенте
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError({
          type: "auth",
          message: "Вы не авторизованы.",
        });
        logger.error("Не удалось получить пользователя при удалении", {
          code: userError?.code,
          message: userError?.message,
          habit_id: id,
        });
        return;
      }

      const { error: deleteError } = await supabase
        .from("habits")
        .delete()
        .eq("id", id)
        .eq("user_id", userData.user.id); // A01: RLS defense-in-depth

      if (deleteError) {
        logger.error("Ошибка удаления привычки", {
          habit_id: id,
          code: deleteError.code,
          message: deleteError.message,
        });
        setError(parseSupabaseError(deleteError));
        return;
      }

      await loadHabits();
    },
    [loadHabits]
  );

  const toggleHabit = useCallback(
    async (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      setError(null);
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError({
          type: "auth",
          message: "Вы не авторизованы.",
        });
        logger.error("Не удалось получить пользователя при toggle", {
          code: userError?.code,
          message: userError?.message,
          habit_id: id,
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const newCompleted = !habit.completed;

      const { error: upsertError } = await supabase
        .from("habit_logs")
        .upsert(
          {
            habit_id: id,
            user_id: userData.user.id,
            log_date: today,
            completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : null,
          },
          { onConflict: "habit_id,log_date" }
        );

      if (upsertError) {
        logger.error("Ошибка обновления отметки", {
          habit_id: id,
          log_date: today,
          completed: newCompleted,
          code: upsertError.code,
          message: upsertError.message,
        });
        setError(parseSupabaseError(upsertError));
        return;
      }

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, completed: newCompleted } : h
        )
      );
    },
    [habits]
  );

  return {
    habits,
    loading,
    error,
    clearError,
    addHabit,
    removeHabit,
    toggleHabit,
  };
}