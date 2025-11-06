-- Safe extension for UUID generation
create extension if not exists "pgcrypto";

-- Admins table to gate write access
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Clubs table
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  location text,
  cover_image_url text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.clubs enable row level security;

-- Announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  event_date timestamp with time zone,       -- optional date/time of event
  location text,                             -- optional location
  club_id uuid references public.clubs(id),  -- optional association to a club
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.announcements enable row level security;

-- Public read policies (anyone can read announcements and clubs)
drop policy if exists "public_can_read_clubs" on public.clubs;
create policy "public_can_read_clubs"
on public.clubs
for select
to anon, authenticated
using (true);

drop policy if exists "public_can_read_announcements" on public.announcements;
create policy "public_can_read_announcements"
on public.announcements
for select
to anon, authenticated
using (true);

-- Admin write policies (only users listed in public.admins)
drop policy if exists "admins_can_write_clubs" on public.clubs;
create policy "admins_can_write_clubs"
on public.clubs
for all
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins_can_write_announcements" on public.announcements;
create policy "admins_can_write_announcements"
on public.announcements
for all
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Ensure join_requests allows anon insert (students) and admin moderation
alter table if exists public.join_requests enable row level security;

-- Public can insert requests (student submissions)
drop policy if exists "public_can_insert_join_requests" on public.join_requests;
create policy "public_can_insert_join_requests"
on public.join_requests
for insert
to anon
with check (true);

-- Admins can read and update requests
drop policy if exists "admins_can_read_join_requests" on public.join_requests;
create policy "admins_can_read_join_requests"
on public.join_requests
for select
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins_can_update_join_requests" on public.join_requests;
create policy "admins_can_update_join_requests"
on public.join_requests
for update
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
