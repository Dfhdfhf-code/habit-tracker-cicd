/** Валидация названия привычки. */
export function validateHabitName(
  name: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0)
    return { valid: false, error: "Поле не может быть пустым" };
  if (trimmed.length < 3)
    return { valid: false, error: "Минимум 3 символа" };
  return { valid: true };
}
