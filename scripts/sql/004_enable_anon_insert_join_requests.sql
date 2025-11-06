-- Safe migration wrapper
begin;

-- Ensure the table exists (idempotent)
create extension if not exists pgcrypto; -- for gen_random_uuid

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  club_slug text not null,
  name text not null,
  email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  admin_notes text,
  source_ip text,
  user_agent text
);

-- Enable RLS
alter table public.join_requests enable row level security;

-- Drop old policies if they exist to avoid duplicates
drop policy if exists "Anon can insert join_requests" on public.join_requests;
drop policy if exists "Authenticated can select join_requests" on public.join_requests;
drop policy if exists "Authenticated can update join_requests" on public.join_requests;

-- Allow anonymous inserts for public join submissions (via anon key).
-- The checks ensure basic required fields are present to reduce junk.
create policy "Anon can insert join_requests"
on public.join_requests
for insert
to anon
with check (
  position('@' in coalesce(email, '')) > 1
  and length(coalesce(name, '')) > 1
  and length(coalesce(club_slug, '')) > 0
);

-- Prefer admins gating if table exists, otherwise fallback to any authenticated
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'admins'
  ) then
    create policy "Admins can select join_requests"
    on public.join_requests
    for select
    to authenticated
    using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

    create policy "Admins can update join_requests"
    on public.join_requests
    for update
    to authenticated
    using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
    with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
  else
    create policy "Authenticated can select join_requests"
    on public.join_requests
    for select
    to authenticated
    using (true);

    create policy "Authenticated can update join_requests"
    on public.join_requests
    for update
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

commit;
