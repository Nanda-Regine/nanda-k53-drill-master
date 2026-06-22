-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 004 — Phase C review fixes
--
-- The live DB schema (pre-existing before migrations 001-003) differs from
-- migration 002's schema. This migration adds the columns Phase C code expects
-- to the live tables, and creates the three RPC increment functions.
-- All changes are additive/idempotent.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── community_posts: add columns the Phase C code expects ─────────────────────
-- Live DB has: id, user_id, post_type, content(jsonb), upvotes, is_public, created_at
-- Code expects: type, content(text), score, total, exam_type, likes, deleted_at
-- votes/answered/explanation were already added to the live DB.
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS type       text,
  ADD COLUMN IF NOT EXISTS score      smallint,
  ADD COLUMN IF NOT EXISTS total      smallint,
  ADD COLUMN IF NOT EXISTS exam_type  text,
  ADD COLUMN IF NOT EXISTS likes      int         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Backfill type from post_type for existing rows
UPDATE community_posts SET type = post_type WHERE type IS NULL AND post_type IS NOT NULL;

-- ── RPC: atomic increment helpers ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE community_posts SET likes = likes + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION increment_post_votes(post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE community_posts SET votes = votes + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION increment_tip_upvotes(tip_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE dltc_tips SET upvotes = upvotes + 1 WHERE id = tip_id;
$$;

-- ── school_students: ensure INSERT policy exists (uses user_id per live schema) ─
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'school_students' AND policyname = 'school_students_insert'
  ) THEN
    CREATE POLICY school_students_insert ON school_students FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
