-- ============================================================
-- Migration 001: Core tables for Habit Tracker
-- ============================================================
-- Таблицы:
--   profiles  — расширение auth.users (displayName, avatar и т.д.)
--   habits    — определения привычек
--   habit_logs — ежедневные записи выполнения (история)
-- ============================================================

-- -----------------------------------------------------------
-- 1. profiles
--    Каждый пользователь Supabase Auth получает запись здесь.
--    Синхронизация через триггер на auth.users.created.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  display_name    text,
  avatar_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 2. habits
--    Хранит определения привычек.
--    Одна привычка = одно определение, привязанное к пользователю.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  icon            text,                    -- эмодзи или иконка
  frequency       text NOT NULL DEFAULT 'daily'
                  CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  target_count    int NOT NULL DEFAULT 1   -- сколько раз за период
                  CHECK (target_count > 0),
  is_archived     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 3. habit_logs
--    Ежедневные записи выполнения.
--    Одна запись на привычку за день (UNIQUE(habit_id, log_date)).
--    Хранит полную историю — от первого дня до сегодня.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id        uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date        date NOT NULL,
  completed       boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,             -- точное время отметки
  notes           text,                    -- заметка за день
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Одна запись на привычку за один день
  UNIQUE(habit_id, log_date)
);
