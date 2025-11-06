-- Safe extension for UUIDs if needed
create extension if not exists pgcrypto;

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  club_name text not null,
  student_name text not null,
  student_email text not null,
  message text,
  status text not null default 'pending',
  admin_notes text
);

-- Ensure required columns exist if table already created
alter table public.join_requests add column if not exists status text not null default 'pending';
alter table public.join_requests add column if not exists admin_notes text;

-- Optional: keep status within allowed set (soft constraint)
-- You can replace with enum in a later migration if desired.

-- Enable RLS
alter table public.join_requests enable row level security;

-- Drop conflicting policies if they exist (idempotent)
do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'join_requests' and policyname = 'Anon can insert requests') then
    drop policy "Anon can insert requests" on public.join_requests;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'join_requests' and policyname = 'Authenticated can read requests') then
    drop policy "Authenticated can read requests" on public.join_requests;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'join_requests' and policyname = 'Authenticated can update status') then
    drop policy "Authenticated can update status" on public.join_requests;
  end if;
end $$;

-- Public (anon) can insert new requests; ensure status remains pending on insert
create policy "Anon can insert requests"
on public.join_requests
as permissive
for insert
to anon
with check (status = 'pending');

-- Authenticated users (admins) can read all
create policy "Authenticated can read requests"
on public.join_requests
as permissive
for select
to authenticated
using (true);

-- Authenticated users (admins) can update status and notes
create policy "Authenticated can update status"
on public.join_requests
as permissive
for update
to authenticated
using (true)
with check (true);
