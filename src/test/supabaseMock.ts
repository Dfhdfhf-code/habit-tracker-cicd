import { vi } from "vitest";

/**
 * Мок Supabase-клиента для тестов.
 * Эмулирует auth и from().select/insert/update/delete
 */

interface MockHabit {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  is_archived: boolean;
}

interface MockLog {
  habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
}

// Внутреннее состояние мока
let mockHabits: MockHabit[] = [];
let mockLogs: MockLog[] = [];

export function resetMockDb() {
  mockHabits = [];
  mockLogs = [];
}

export function seedMockHabits(habits: MockHabit[]) {
  mockHabits = [...habits];
}

export function seedMockLogs(logs: MockLog[]) {
  mockLogs = [...logs];
}

export function getMockHabits() {
  return mockHabits;
}

// Мок query builder
function createQueryBuilder(table: string) {
  const filters: Record<string, unknown> = {};

  const builder = {
    select: vi.fn(() => builder),
    insert: vi.fn((data: unknown) => {
      if (table === "habits") {
        const item = data as Partial<MockHabit>;
        mockHabits.push({
          id: `habit-${mockHabits.length + 1}`,
          user_id: item.user_id ?? "",
          name: item.name ?? "",
          created_at: new Date().toISOString(),
          is_archived: false,
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    delete: vi.fn(() => builder),
    update: vi.fn(() => builder),
    upsert: vi.fn((data: unknown) => {
      if (table === "habit_logs") {
        const item = data as Partial<MockLog>;
        const existing = mockLogs.find(
          (l) =>
            l.habit_id === item.habit_id && l.log_date === item.log_date
        );
        if (existing) {
          existing.completed = item.completed ?? false;
        } else {
          mockLogs.push({
            habit_id: item.habit_id ?? "",
            user_id: item.user_id ?? "",
            log_date: item.log_date ?? "",
            completed: item.completed ?? false,
          });
        }
      }
      return Promise.resolve({ data: null, error: null });
    }),
    eq: vi.fn((column: string, value: unknown) => {
      filters[column] = value;

      // Для delete привычек
      if (
        table === "habits" &&
        column === "id" &&
        typeof value === "string"
      ) {
        mockHabits = mockHabits.filter((h) => h.id !== value);
      }

      return builder;
    }),
    order: vi.fn(() => builder),
    then: vi.fn((onFulfilled: (value: unknown) => unknown) => {
      // Имитируем ответ на select
      if (table === "habits") {
        return Promise.resolve({
          data: mockHabits,
          error: null,
        }).then(onFulfilled);
      }
      if (table === "habit_logs") {
        return Promise.resolve({
          data: mockLogs,
          error: null,
        }).then(onFulfilled);
      }
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    }),
  };

  return builder;
}

// Основной мок
export const supabaseMock = {
  auth: {
    getUser: vi.fn(async () => ({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      },
      error: null,
    })),
    getSession: vi.fn(async () => ({
      data: { session: null },
      error: null,
    })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn((table: string) => createQueryBuilder(table)),
};