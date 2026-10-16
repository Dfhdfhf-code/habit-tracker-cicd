import React from "react";
import type { Habit } from "../types/habit";

export interface HabitListProps {
  title?: string;
  habits: Habit[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

const HabitItem = ({
  habit,
  onToggle,
  onRemove,
}: {
  habit: Habit;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) => (
  <li
    className={`habit-item ${habit.completed ? "habit-item-completed" : ""}`}
  >
    <input
      type="checkbox"
      className="glass-checkbox"
      checked={habit.completed}
      onChange={() => onToggle(habit.id)}
      aria-label={`Отметить "${habit.name}" как выполненную`}
    />
    <span>{habit.name}</span>
    <button
      type="button"
      className="glass-button-danger"
      onClick={() => onRemove(habit.id)}
      aria-label={`Удалить привычку "${habit.name}"`}
    >
      Удалить
    </button>
  </li>
);

const MemoizedHabitItem = React.memo(HabitItem);

/**
 * Компонент отображения списка привычек.
 * Стиль: Glassmorphism.
 */
export function HabitList({
  title = "Список привычек",
  habits,
  onToggle,
  onRemove,
}: HabitListProps) {
  return (
    <div className="glass-card">
      <h2 className="card-title">{title}</h2>

      {habits.length === 0 ? (
        <div className="empty-message">
          <p>Привычек пока нет.</p>
          <p className="small">Добавьте первую привычку выше.</p>
        </div>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => (
            <MemoizedHabitItem
              key={habit.id}
              habit={habit}
              onToggle={onToggle}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default HabitList;