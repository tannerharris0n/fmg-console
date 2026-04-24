-- FMG Console - Supabase schema
--
-- Run this in your Supabase SQL editor. It sets up the user_preferences
-- table that stores per-user dashboard preset and tile layout.

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preset text not null default 'network' check (preset in ('network','security','custom')),
  hidden_tiles jsonb not null default '[]'::jsonb,
  tile_order jsonb,
  updated_at timestamptz not null default now()
);

-- Row level security. The backend uses the service role key so RLS does
-- not apply to it, but enabling RLS keeps the client-side safe if the
-- frontend ever queries this table directly.
alter table public.user_preferences enable row level security;

create policy "users read own prefs"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "users upsert own prefs"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "users update own prefs"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Optional: audit log table for future use.
create table if not exists public.audit_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
