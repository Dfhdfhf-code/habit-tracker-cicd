import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitList } from "./HabitList";
import type { Habit } from "../types/habit";

const mockHabits: Habit[] = [
  { id: "1", name: "Пить воду", completed: false, createdAt: "2026-10-14" },
  { id: "2", name: "Читать", completed: true, createdAt: "2026-10-14" },
];

describe("HabitList", () => {
  it("отображает все привычки из списка", () => {
    render(
      <HabitList habits={mockHabits} onToggle={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("Пить воду")).toBeInTheDocument();
    expect(screen.getByText("Читать")).toBeInTheDocument();
  });

  it("показывает заглушку при пустом списке", () => {
    render(<HabitList habits={[]} onToggle={() => {}} onRemove={() => {}} />);
    expect(screen.getByText(/Привычек пока нет/)).toBeInTheDocument();
  });

  it("вызывает onToggle при клике на чекбокс", () => {
    const handleToggle = vi.fn();
    render(
      <HabitList habits={mockHabits} onToggle={handleToggle} onRemove={() => {}} />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(handleToggle).toHaveBeenCalledWith("1");
  });

  it("вызывает onRemove при клике на кнопку удаления", () => {
    const handleRemove = vi.fn();
    render(
      <HabitList habits={mockHabits} onToggle={() => {}} onRemove={handleRemove} />
    );
    const deleteButtons = screen.getAllByRole("button", { name: /Удалить/ });
    fireEvent.click(deleteButtons[0]);
    expect(handleRemove).toHaveBeenCalledWith("1");
  });
});