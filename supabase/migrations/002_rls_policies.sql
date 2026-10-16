-- ============================================================
-- Migration 002: Row Level Security policies
-- ============================================================
-- RLS включён на уровне таблицы — данные видимы только
-- авторизованному владельцу (user_id = auth.uid()).
--
-- Анонимные пользователи (не вошедшие) не имеют доступа
-- ни к одной таблице.
-- ============================================================

-- -----------------------------------------------------------
-- profiles
-- -----------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Владельцы видят только свои профили
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Владельцы могут обновлять свой профиль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------
-- habits
-- -----------------------------------------------------------
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Чтение: только владелец привычки
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

-- Вставка: новая привычка привязывается к текущему пользователю
CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Обновление: только владелец
CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Удаление: только владелец
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------
-- habit_logs
-- -----------------------------------------------------------
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Чтение: только владелец привычки (и user_id совпадает)
CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Вставка: привязка к текущему пользователю
CREATE POLICY "Users can insert own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Обновление: только владелец
CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Удаление: только владелец
CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);
