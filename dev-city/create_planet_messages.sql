create table public.planet_messages (
  id uuid default gen_random_uuid() primary key,
  planet_id text not null,
  github_username text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on row level security
alter table public.planet_messages enable row level security;

-- Allow anyone to read messages
create policy "Allow public read access" on public.planet_messages
  for select using (true);

-- Allow authenticated or anonymous insert (demo app rules)
create policy "Allow insert access" on public.planet_messages
  for insert with check (true);
