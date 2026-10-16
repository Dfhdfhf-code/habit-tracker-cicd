import { useEffect } from "react";
import { useHabits } from "../hooks/useHabits";
import AddHabitForm from "./AddHabitForm";
import HabitList from "./HabitList";
import HabitCounter from "./HabitCounter";

/**
 * Компонент-обёртка для трекера привычек.
 * Показывает ошибки при работе с Supabase.
 */
export function HabitTracker() {
  const {
    habits,
    loading,
    error,
    clearError,
    addHabit,
    toggleHabit,
    removeHabit,
  } = useHabits();

  // Автоскрытие ошибки через 5 секунд
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 5000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;

  if (loading) {
    return (
      <div className="glass-card">
        <p className="empty-message">Загрузка привычек...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="glass-card"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.2)",
            borderColor: "rgba(231, 76, 60, 0.5)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            marginBottom: 16,
          }}
        >
          <p className="message-error" style={{ margin: 0 }}>
            {error.message}
          </p>
          <button
            onClick={clearError}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
              padding: "0 8px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <HabitCounter completed={completedCount} total={totalCount} />

      <AddHabitForm onAdd={addHabit} />

      <HabitList
        title="Мои привычки"
        habits={habits}
        onToggle={toggleHabit}
        onRemove={removeHabit}
      />
    </>
  );
}

export default HabitTracker;