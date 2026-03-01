-- K53 Drill Master · Supabase setup
-- Run this in your Supabase project: SQL Editor → New query → paste & run

-- ── subscribers table ─────────────────────────────────────────────────────────
create table if not exists subscribers (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users not null unique,
  email       text,
  plan        text        not null default 'monthly', -- 'monthly' | 'annual'
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table subscribers enable row level security;

-- Users can only read their own row
create policy "Own row only"
  on subscribers
  for select
  using (auth.uid() = user_id);

-- ── Add a subscriber (run manually per paying user) ───────────────────────────
-- Replace the email and adjust expires_at as needed.
--
-- insert into subscribers (user_id, email, plan, expires_at)
-- values (
--   (select id from auth.users where email = 'customer@example.com'),
--   'customer@example.com',
--   'monthly',
--   now() + interval '1 month'
-- );
