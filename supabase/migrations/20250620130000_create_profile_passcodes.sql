create table if not exists public.profile_passcodes (
  share_code text not null,
  profile_id text not null,
  passcode_hash text not null,
  created_at timestamptz not null default now(),
  primary key (share_code, profile_id),
  constraint profile_passcodes_share_code_fkey
    foreign key (share_code) references public.trips (share_code) on delete cascade
);

create index if not exists profile_passcodes_share_code_idx
  on public.profile_passcodes (share_code);

alter table public.profile_passcodes enable row level security;

create policy "profile_passcodes_select"
  on public.profile_passcodes for select
  using (true);

create policy "profile_passcodes_insert"
  on public.profile_passcodes for insert
  with check (true);

create policy "profile_passcodes_update"
  on public.profile_passcodes for update
  using (true)
  with check (true);

create policy "profile_passcodes_delete"
  on public.profile_passcodes for delete
  using (true);
