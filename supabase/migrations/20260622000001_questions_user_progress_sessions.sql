-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 001 — Core learning tables
-- questions · user_progress · study_sessions
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── questions ──────────────────────────────────────────────────────────────────
-- Single table for all question types. external_id is the stable key games use
-- (e.g. 'R1', 'vc01', 'rr001') — it matches the id field in the JS data files.
CREATE TABLE IF NOT EXISTS questions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id    text        UNIQUE NOT NULL,
  type           text        NOT NULL CHECK (type IN ('signs','rules','controls','scenarios','markings')),
  code           text,
  category       text,
  question_text  text        NOT NULL,
  options        jsonb       NOT NULL,        -- array of 4 strings; options[0] is always correct
  correct_answer text        NOT NULL,        -- denormalised copy of options[0] for fast lookups
  image_path     text,                        -- /signs/stop-sign.jpg
  hint           text,
  explanation    text,                        -- static fallback; AI generates dynamic explanations
  difficulty     smallint    NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  code_types     text[]      NOT NULL DEFAULT '{"code8"}',
  schema_ver     smallint    NOT NULL DEFAULT 1,
  deleted_at     timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_type_idx      ON questions (type)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS questions_code_type_idx ON questions USING GIN (code_types);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'questions_updated_at') THEN
    CREATE TRIGGER questions_updated_at
      BEFORE UPDATE ON questions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- RLS: anyone can read non-deleted questions; only service role can write
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY questions_read ON questions FOR SELECT USING (deleted_at IS NULL);

-- ── user_progress ─────────────────────────────────────────────────────────────
-- Leitner box spaced repetition per user per question.
-- box_level 1=review tomorrow, 2=3d, 3=7d, 4=14d, 5=30d
CREATE TABLE IF NOT EXISTS user_progress (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id   text        NOT NULL REFERENCES questions(external_id) ON DELETE CASCADE,
  box_level     smallint    NOT NULL DEFAULT 1 CHECK (box_level BETWEEN 1 AND 5),
  correct       boolean     NOT NULL,
  streak        smallint    NOT NULL DEFAULT 0,
  answered_at   timestamptz NOT NULL DEFAULT now(),
  next_review   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

-- Compute next_review date based on Leitner box level
CREATE OR REPLACE FUNCTION compute_next_review(box smallint, answered timestamptz)
RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$
  SELECT answered + CASE box
    WHEN 1 THEN INTERVAL '1 day'
    WHEN 2 THEN INTERVAL '3 days'
    WHEN 3 THEN INTERVAL '7 days'
    WHEN 4 THEN INTERVAL '14 days'
    ELSE          INTERVAL '30 days'
  END;
$$;

-- Auto-set next_review before upsert
CREATE OR REPLACE FUNCTION user_progress_set_next_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.next_review = compute_next_review(NEW.box_level, NEW.answered_at);
  NEW.updated_at  = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_progress_before_upsert') THEN
    CREATE TRIGGER user_progress_before_upsert
      BEFORE INSERT OR UPDATE ON user_progress
      FOR EACH ROW EXECUTE FUNCTION user_progress_set_next_review();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS user_progress_user_idx     ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS user_progress_review_idx   ON user_progress (user_id, next_review) WHERE box_level < 5;

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_progress_own ON user_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── study_sessions ────────────────────────────────────────────────────────────
-- One row per completed game session. Used for analytics, streaks, history.
CREATE TABLE IF NOT EXISTS study_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id      text        NOT NULL,   -- matches GAME_NERVE_MAP keys in App.jsx
  nerve_id     text,                   -- signs|rules|controls|scenarios|markings|practical
  score        smallint    NOT NULL,
  total        smallint    NOT NULL,
  duration_ms  int,
  passed       boolean     GENERATED ALWAYS AS (score::numeric / NULLIF(total,0) >= 0.75) STORED,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx  ON study_sessions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS sessions_nerve_idx ON study_sessions (user_id, nerve_id);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_own ON study_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
