/**
 * Тип, описывающий привычку в приложении Habit Tracker.
 */
export interface Habit {
  /** Уникальный идентификатор привычки. */
  id: string;

  /** Название привычки. */
  name: string;

  /** Выполнена ли привычка сегодня. */
  completed: boolean;

  /** Дата и время создания привычки (ISO-8601). */
  createdAt: string;
}
