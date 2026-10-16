import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Мокаем supabase ДО импорта useHabits
import { supabaseMock } from "../test/supabaseMock";

vi.mock("../lib/supabase", () => ({
  supabase: supabaseMock,
}));

import { useHabits } from "./useHabits";
import {
  resetMockDb,
  seedMockHabits,
  seedMockLogs,
} from "../test/supabaseMock";

describe("useHabits (Supabase)", () => {
  beforeEach(() => {
    resetMockDb();
  });

  it("загружает привычки из Supabase", async () => {
    seedMockHabits([
      {
        id: "h1",
        user_id: "test-user-id",
        name: "Пить воду",
        created_at: "2026-10-16",
        is_archived: false,
      },
      {
        id: "h2",
        user_id: "test-user-id",
        name: "Читать",
        created_at: "2026-10-16",
        is_archived: false,
      },
    ]);

    const { result } = renderHook(() => useHabits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.habits).toHaveLength(2);
    expect(result.current.habits[0].name).toBe("Пить воду");
  });

  it("добавляет привычку через Supabase", async () => {
    const { result } = renderHook(() => useHabits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addHabit("Утренняя зарядка");
    });

    await waitFor(() => {
      expect(result.current.habits).toHaveLength(1);
    });

    expect(result.current.habits[0].name).toBe("Утренняя зарядка");
  });

  it("удаляет привычку через Supabase", async () => {
    seedMockHabits([
      {
        id: "h1",
        user_id: "test-user-id",
        name: "Пить воду",
        created_at: "2026-10-16",
        is_archived: false,
      },
    ]);

    const { result } = renderHook(() => useHabits());

    await waitFor(() => {
      expect(result.current.habits).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeHabit("h1");
    });

    await waitFor(() => {
      expect(result.current.habits).toHaveLength(0);
    });
  });

  it("переключает выполнение через habit_logs", async () => {
    seedMockHabits([
      {
        id: "h1",
        user_id: "test-user-id",
        name: "Пить воду",
        created_at: "2026-10-16",
        is_archived: false,
      },
    ]);

    const { result } = renderHook(() => useHabits());

    await waitFor(() => {
      expect(result.current.habits).toHaveLength(1);
    });

    expect(result.current.habits[0].completed).toBe(false);

    await act(async () => {
      await result.current.toggleHabit("h1");
    });

    await waitFor(() => {
      expect(result.current.habits[0].completed).toBe(true);
    });
  });

  it("загружает отметки за сегодня", async () => {
    seedMockHabits([
      {
        id: "h1",
        user_id: "test-user-id",
        name: "Пить воду",
        created_at: "2026-10-16",
        is_archived: false,
      },
    ]);

    const today = new Date().toISOString().split("T")[0];
    seedMockLogs([
      {
        habit_id: "h1",
        user_id: "test-user-id",
        log_date: today,
        completed: true,
      },
    ]);

    const { result } = renderHook(() => useHabits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.habits[0].completed).toBe(true);
  });
});