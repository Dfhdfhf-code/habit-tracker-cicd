/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddHabitForm } from "./AddHabitForm";

describe("AddHabitForm", () => {
  it("кнопка 'Добавить' disabled при пустом поле", () => {
    render(<AddHabitForm onAdd={() => {}} />);
    const button = screen.getByRole("button", { name: /Добавить/ });
    expect(button).toBeDisabled();
  });

  it("кнопка активна при вводе 3+ символов", () => {
    render(<AddHabitForm onAdd={() => {}} />);
    const input = screen.getByPlaceholderText(/Название привычки/);
    fireEvent.change(input, { target: { value: "Пить воду" } });
    const button = screen.getByRole("button", { name: /Добавить/ });
    expect(button).not.toBeDisabled();
  });

  it("вызывает onAdd при отправке формы", () => {
    const handleAdd = vi.fn();
    render(<AddHabitForm onAdd={handleAdd} />);
    const input = screen.getByPlaceholderText(/Название привычки/);
    const button = screen.getByRole("button", { name: /Добавить/ });
    fireEvent.change(input, { target: { value: "Пить воду" } });
    fireEvent.click(button);
    expect(handleAdd).toHaveBeenCalledWith("Пить воду");
  });

  it("показывает ошибку при коротком названии", () => {
    render(<AddHabitForm onAdd={() => {}} />);
    const input = screen.getByPlaceholderText(/Название привычки/);
    const button = screen.getByRole("button", { name: /Добавить/ });
    fireEvent.change(input, { target: { value: "Пи" } });
    fireEvent.click(button);
    expect(screen.getByText(/минимум 3 символа/)).toBeInTheDocument();
  });
});