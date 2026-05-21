-- K53 Drill Master · Supabase setup
-- Run this in your Supabase project: SQL Editor → New query → paste & run

-- ── subscribers table ─────────────────────────────────────────────────────────
create table if not exists subscribers (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        references auth.users not null unique,
  email               text,
  plan                text        not null default 'monthly', -- 'monthly' | 'bundle' | 'lifetime' | 'lifetime_pdp'
  expires_at          timestamptz not null,
  status              text        not null default 'active', -- 'active' | 'cancelled'
  payfast_payment_id  text,
  payfast_token       text,
  cancelled_at        timestamptz,
  updated_at          timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

-- Migration: add columns to existing subscribers table (idempotent)
alter table subscribers add column if not exists status             text        not null default 'active';
alter table subscribers add column if not exists payfast_payment_id text;
alter table subscribers add column if not exists payfast_token      text;
alter table subscribers add column if not exists cancelled_at       timestamptz;
alter table subscribers add column if not exists updated_at         timestamptz not null default now();

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
