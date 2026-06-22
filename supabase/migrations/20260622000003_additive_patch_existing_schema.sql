-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 003 — Additive patch for pre-existing K53 Supabase schema
--
-- The project already had tables from an earlier sprint (questions, user_progress,
-- study_sessions, schools, etc.) with slightly different column names.
-- Migrations 001 and 002 used IF NOT EXISTS so they were no-ops.
-- This migration adds ONLY the columns and tables that are missing.
-- All changes are backwards-compatible — no existing columns are modified.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── questions: add missing columns ───────────────────────────────────────────
-- external_id: stable text key matching the JS data files (R1, vc01, rr001, etc.)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS external_id text;
CREATE UNIQUE INDEX IF NOT EXISTS questions_external_id_idx ON questions (external_id)
  WHERE external_id IS NOT NULL;

-- type: question category — signs | rules | controls | scenarios | markings
ALTER TABLE questions ADD COLUMN IF NOT EXISTS type text;
CREATE INDEX IF NOT EXISTS questions_type_idx ON questions (type) WHERE is_active = true;

-- hint: short memory aid (distinct from full explanation)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS hint text;

-- deleted_at: CLAUDE.md requires soft-delete via timestamp (existing is_active boolean
-- will remain for backwards compat; new code should also set deleted_at on delete)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- schema_ver: seed script version tracking
ALTER TABLE questions ADD COLUMN IF NOT EXISTS schema_ver smallint DEFAULT 1;

-- ── user_progress: add missing columns ────────────────────────────────────────
-- answered_at: when the answer was recorded (existing last_reviewed is close but
-- only tracks last, not the event time for the current upsert)
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS answered_at timestamptz;

-- correct: single boolean for the most recent answer (existing has correct_count/wrong_count)
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS correct boolean;

-- streak: consecutive correct answers
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak smallint DEFAULT 0;

-- ── study_sessions: add missing columns ──────────────────────────────────────
-- nerve_id: maps to the app's nerve system (signs/rules/controls/scenarios/markings/practical)
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS nerve_id text;

-- duration_ms: milliseconds (existing has duration_seconds; add ms for precision)
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS duration_ms int;

-- game_id: alias for game_mode to match GAME_NERVE_MAP key names in App.jsx
-- (existing column is game_mode; add game_id as a generated alias if needed,
-- or just use game_mode — we'll alias in the app layer)

-- ── badges_earned: new table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges_earned (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id  text        NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='badges_earned' AND policyname='badges_own'
  ) THEN
    CREATE POLICY badges_own ON badges_earned FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── referrals: new table (schools already exists) ─────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id     uuid        NOT NULL REFERENCES instructors(id),
  referred_user_id  uuid        NOT NULL REFERENCES auth.users(id),
  plan              text        NOT NULL,
  amount_zar        numeric(10,2) NOT NULL,
  commission_zar    numeric(10,2) NOT NULL,
  payfast_payment_id text,
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='referrals_own'
  ) THEN
    CREATE POLICY referrals_own ON referrals FOR SELECT
      USING (EXISTS (SELECT 1 FROM instructors i WHERE i.id = instructor_id AND i.user_id = auth.uid()));
  END IF;
END $$;

-- ── Ensure set_updated_at function exists (migration 001 may have been skipped) ─
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
