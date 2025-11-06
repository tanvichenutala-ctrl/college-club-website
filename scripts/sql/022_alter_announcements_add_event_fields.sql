-- This script is idempotent and safe to re-run.

begin;

-- Ensure the announcements table exists before altering
do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'announcements'
  ) then
    raise exception 'Table public.announcements does not exist. Run the base migration that creates it before this script.';
  end if;
end $$;

alter table public.announcements
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at   timestamptz,
  add column if not exists is_event  boolean not null default false,
  add column if not exists club_id   uuid;

-- Optionally add FK to clubs if it exists (avoid failing if clubs not created yet)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'clubs'
  ) then
    -- add FK only if not present already
    if not exists (
      select 1
      from information_schema.table_constraints tc
      where tc.table_schema = 'public'
        and tc.table_name = 'announcements'
        and tc.constraint_type = 'FOREIGN KEY'
        and tc.constraint_name = 'announcements_club_id_fkey'
    ) then
      alter table public.announcements
        add constraint announcements_club_id_fkey
        foreign key (club_id) references public.clubs(id) on delete set null;
    end if;
  end if;
end $$;

commit;
