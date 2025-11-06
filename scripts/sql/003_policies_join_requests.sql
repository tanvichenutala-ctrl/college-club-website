create extension if not exists pgcrypto;

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  club_name text not null,
  student_name text not null,
  email text not null,
  phone text not null,
  reason text,
  status text not null default 'pending',
  admin_notes text
);

alter table public.join_requests enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='join_requests' and policyname='Anon can insert requests') then
    drop policy "Anon can insert requests" on public.join_requests;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='join_requests' and policyname='Authenticated can read requests') then
    drop policy "Authenticated can read requests" on public.join_requests;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='join_requests' and policyname='Authenticated can update status') then
    drop policy "Authenticated can update status" on public.join_requests;
  end if;
end $$;

create policy "Anon can insert requests"
on public.join_requests
for insert
to anon
with check (status = 'pending');

create policy "Authenticated can read requests"
on public.join_requests
for select
to authenticated
using (true);

create policy "Authenticated can update status"
on public.join_requests
for update
to authenticated
using (true)
with check (true);
