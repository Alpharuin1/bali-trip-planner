-- Manual fallback: paste this in Supabase SQL Editor if migrations did not run yet.
-- Preferred path: push to GitHub (supabase/migrations/) with your linked Supabase project.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  share_code text not null unique,
  title text not null default 'Bali Trip',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_share_code_idx on public.trips (share_code);

alter table public.trips enable row level security;

create policy "trips_select_by_share_code"
  on public.trips for select
  using (true);

create policy "trips_insert"
  on public.trips for insert
  with check (true);

create policy "trips_update_by_share_code"
  on public.trips for update
  using (true)
  with check (true);
