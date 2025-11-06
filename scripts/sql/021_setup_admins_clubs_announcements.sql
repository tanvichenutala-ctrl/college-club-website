-- Enable required extension
create extension if not exists "pgcrypto";

-- Admins table
create table if not exists public.admins (
  user_id uuid primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Allow a user to read their own admin row (for isAdmin checks)
do $$
begin
  if not exists (
    select 1 from pg_policies where polname = 'admin_self_select' and tablename = 'admins'
  ) then
    create policy admin_self_select on public.admins
      for select using (auth.uid() = user_id);
  end if;
end $$;

-- Clubs table
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text,
  location text,
  join_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.clubs enable row level security;

-- Announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  title text not null,
  summary text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_event boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Public can read clubs and announcements
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'clubs_read_all') then
    create policy clubs_read_all on public.clubs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'announcements_read_all') then
    create policy announcements_read_all on public.announcements for select using (true);
  end if;
end $$;

-- Only admins can write (insert/update/delete) clubs/announcements
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'clubs_write_admin') then
    create policy clubs_write_admin on public.clubs
      for all
      to authenticated
      using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
      with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where polname = 'announcements_write_admin') then
    create policy announcements_write_admin on public.announcements
      for all
      to authenticated
      using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
      with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
  end if;
end $$;

-- Helpful indexes
create index if not exists idx_clubs_slug on public.clubs(slug);
create index if not exists idx_announcements_starts_at on public.announcements(starts_at);
create index if not exists idx_announcements_ends_at on public.announcements(ends_at);
create index if not exists idx_announcements_club_id on public.announcements(club_id);
