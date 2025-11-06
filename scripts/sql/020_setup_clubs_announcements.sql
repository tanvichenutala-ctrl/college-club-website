-- create admins, clubs, announcements with RLS (public read; admin write)
-- Note: requires pgcrypto or extensions for gen_random_uuid in some setups; falls back to uuid_generate_v4 if needed.

-- admins (list of user IDs who have admin rights)
create table if not exists public.admins (
  user_id uuid primary key
);

-- clubs
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  google_form_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.clubs enable row level security;
alter table public.announcements enable row level security;

-- Public read
drop policy if exists "clubs_public_read" on public.clubs;
create policy "clubs_public_read" on public.clubs
  for select using (true);

drop policy if exists "ann_public_read" on public.announcements;
create policy "ann_public_read" on public.announcements
  for select using (true);

-- Admin write
drop policy if exists "clubs_admin_write" on public.clubs;
create policy "clubs_admin_write" on public.clubs
  for all
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "ann_admin_write" on public.announcements;
create policy "ann_admin_write" on public.announcements
  for all
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
