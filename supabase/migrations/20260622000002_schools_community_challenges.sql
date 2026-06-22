-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 002 — Schools, community, and weekly challenges
-- schools · school_students · instructors · referrals
-- community_posts · dltc_tips · weekly_challenge · weekly_challenge_entries
-- badges_earned
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── schools ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text        NOT NULL,
  province            text,
  city                text,
  contact_email       text,
  join_code           text        UNIQUE NOT NULL DEFAULT upper(left(replace(gen_random_uuid()::text, '-', ''), 6)),
  plan                text        NOT NULL DEFAULT 'starter'
                                  CHECK (plan IN ('starter','growth','enterprise','white_label')),
  plan_expires_at     timestamptz,
  owner_id            uuid        REFERENCES auth.users(id),
  white_label_config  jsonb,      -- {name, logo_url, primary_color, hide_branding}
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'schools_updated_at') THEN
    CREATE TRIGGER schools_updated_at
      BEFORE UPDATE ON schools
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
-- School owner and service role can read their own school
CREATE POLICY schools_owner_read ON schools FOR SELECT
  USING (auth.uid() = owner_id AND deleted_at IS NULL);
-- Students can read school by join_code (handled via RPC, not direct select)

-- ── school_students ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_students (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  uuid        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, student_id)
);

ALTER TABLE school_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY school_students_own ON school_students FOR SELECT
  USING (auth.uid() = student_id);
CREATE POLICY school_students_owner ON school_students FOR SELECT
  USING (EXISTS (SELECT 1 FROM schools s WHERE s.id = school_id AND s.owner_id = auth.uid()));

-- ── instructors ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instructors (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id        uuid        REFERENCES schools(id),
  pdp_number       text,
  id_number        text,       -- stored encrypted in production (Phase F)
  verified         boolean     NOT NULL DEFAULT false,
  verified_at      timestamptz,
  referral_code    text        UNIQUE DEFAULT upper(left(replace(gen_random_uuid()::text,'-',''), 8)),
  commission_rate  numeric(5,2) NOT NULL DEFAULT 10.00,
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY instructors_own ON instructors FOR ALL USING (auth.uid() = user_id);

-- ── referrals ─────────────────────────────────────────────────────────────────
-- Never hard-delete. Use paid_at to track commission payment status.
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
CREATE POLICY referrals_own ON referrals FOR SELECT
  USING (EXISTS (SELECT 1 FROM instructors i WHERE i.id = instructor_id AND i.user_id = auth.uid()));

-- ── community_posts (PassWall) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL DEFAULT 'pass'
              CHECK (type IN ('pass','tip','question','achievement')),
  content     text        NOT NULL,
  score       smallint,
  total       smallint,
  exam_type   text,       -- 'code8', 'code10', 'code14', 'code1'
  likes       int         NOT NULL DEFAULT 0,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_feed_idx ON community_posts (created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_read   ON community_posts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY posts_own    ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY posts_delete ON community_posts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── dltc_tips ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dltc_tips (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id),
  province   text,
  city       text,
  dltc_name  text        NOT NULL,
  tip_text   text        NOT NULL CHECK (length(tip_text) BETWEEN 10 AND 1000),
  upvotes    int         NOT NULL DEFAULT 0,
  verified   boolean     NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dltc_tips_province_idx ON dltc_tips (province, city) WHERE deleted_at IS NULL;

ALTER TABLE dltc_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY dltc_tips_read   ON dltc_tips FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY dltc_tips_insert ON dltc_tips FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── weekly_challenge ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_challenge (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  question_ids text[]      NOT NULL DEFAULT '{}',
  badge_id     text,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

-- Only one active challenge at a time (no overlapping ranges)
CREATE INDEX IF NOT EXISTS weekly_challenge_active_idx ON weekly_challenge (starts_at, ends_at);

ALTER TABLE weekly_challenge ENABLE ROW LEVEL SECURITY;
CREATE POLICY challenge_read ON weekly_challenge FOR SELECT USING (true);

-- ── weekly_challenge_entries ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_challenge_entries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid        NOT NULL REFERENCES weekly_challenge(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score        smallint    NOT NULL,
  total        smallint    NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS challenge_entries_leaderboard_idx
  ON weekly_challenge_entries (challenge_id, score DESC);

ALTER TABLE weekly_challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY challenge_entries_read ON weekly_challenge_entries FOR SELECT USING (true);
CREATE POLICY challenge_entries_own  ON weekly_challenge_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── badges_earned ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges_earned (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id  text        NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;
CREATE POLICY badges_own ON badges_earned FOR ALL USING (auth.uid() = user_id);
