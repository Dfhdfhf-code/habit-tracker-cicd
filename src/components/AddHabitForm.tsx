import { useCallback, useState } from "react";
import { validateHabitName } from "../utils/validate";

export type AddHabitState = "idle" | "typing" | "error" | "success";

export interface AddHabitFormProps {
  onAdd: (name: string) => void;
}

/**
 * Форма добавления новой привычки.
 * Стиль: Glassmorphism.
 */
export function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<AddHabitState>("idle");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setValue(text);
      if (text.length === 0) {
        setState("idle");
      } else if (text.length < 3) {
        setState("typing");
      } else {
        setState("idle");
      }
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const result = validateHabitName(value);
      if (!result.valid) {
        setState("error");
        return;
      }
      onAdd(value.trim());
      setValue("");
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    },
    [value, onAdd]
  );

  const isDisabled = value.trim().length === 0;

  return (
    <div className="glass-card">
      <h2 className="card-title">Добавить привычку</h2>
      <form onSubmit={handleSubmit} className="add-habit-form">
        <input
          className="glass-input"
          value={value}
          onChange={handleChange}
          placeholder="Название привычки (минимум 3 символа)"
          aria-invalid={state === "error"}
        />
        {state === "error" && (
          <p className="message-error">
            Название должно содержать минимум 3 символа.
          </p>
        )}
        {state === "success" && (
          <p className="message-success">Привычка успешно добавлена!</p>
        )}
        <button
          type="submit"
          disabled={isDisabled}
          className="glass-button"
          style={{ alignSelf: "flex-start" }}
        >
          Добавить
        </button>
      </form>
    </div>
  );
}

export default AddHabitForm;