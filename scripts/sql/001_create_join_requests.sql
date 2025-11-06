-- Table
create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  student_name text not null,
  email text not null,
  phone text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.join_requests enable row level security;

-- Policies
-- Allow anonymous inserts (students have no login)
create policy "allow_anon_insert_join_requests"
  on public.join_requests
  for insert
  to anon
  with check (true);

-- Allow authenticated users (admins) to select all
create policy "allow_auth_select_join_requests"
  on public.join_requests
  for select
  to authenticated
  using (true);

-- Allow authenticated users to update status (approve/reject)
create policy "allow_auth_update_join_requests"
  on public.join_requests
  for update
  to authenticated
  using (true)
  with check (true);

-- Optionally allow authenticated delete (cleanup)
create policy "allow_auth_delete_join_requests"
  on public.join_requests
  for delete
  to authenticated
  using (true);
