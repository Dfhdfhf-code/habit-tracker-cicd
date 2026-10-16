import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HabitCounter } from "./HabitCounter";

describe("HabitCounter", () => {
  it("отображает количество выполненных привычек", () => {
    render(<HabitCounter completed={3} total={5} />);
    expect(screen.getByText(/3 из 5/)).toBeInTheDocument();
  });

  it("отображает процент выполнения", () => {
    render(<HabitCounter completed={3} total={5} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("обрабатывает total = 0 без деления на ноль", () => {
    render(<HabitCounter completed={0} total={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("отображает 0% при completed = 0 и total > 0", () => {
    render(<HabitCounter completed={0} total={10} />);
    expect(screen.getByText(/0 из 10/)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("отображает 100% при completed = total", () => {
    render(<HabitCounter completed={5} total={5} />);
    expect(screen.getByText(/5 из 5/)).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("корректно считает при completed > total (переполнение)", () => {
    render(<HabitCounter completed={5} total={3} />);
    expect(screen.getByText(/5 из 3/)).toBeInTheDocument();
    expect(screen.getByText("167%")).toBeInTheDocument();
  });
});