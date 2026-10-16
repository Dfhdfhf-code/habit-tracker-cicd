export interface HabitCounterProps {
  completed: number;
  total: number;
}

/**
 * Компонент отображения прогресса выполнения привычек.
 * Стиль: Glassmorphism.
 */
export function HabitCounter({
  completed,
  total,
}: HabitCounterProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="glass-card">
      <div className="counter-row">
        <span className="counter-text">
          Выполнено: {completed} из {total}
        </span>
        <span className="counter-percent">{percentage}%</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default HabitCounter;