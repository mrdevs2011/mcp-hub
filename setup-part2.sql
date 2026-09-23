-- MRdrive extra columns (if they haven't been added yet)
-- Supabase Dashboard -> SQL Editor -> run this file
-- Safe: if they already exist, nothing breaks.

alter table files add column if not exists is_public boolean default false;
alter table files add column if not exists public_token text unique;
alter table files add column if not exists expires_at timestamptz;
alter table files add column if not exists folder text;
alter table files add column if not exists download_count integer default 0;

create table if not exists folders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamptz default now()
);

alter table folders enable row level security;

do $$ begin
  create policy "users select own folders" on folders for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users insert own folders" on folders for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users delete own folders" on folders for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Lets a file be viewed through a public link (without authentication)
do $$ begin
  create policy "anyone can read public files"
    on files for select
    using (is_public = true);
exception when duplicate_object then null; end $$;

create or replace function increment_download_count(file_id bigint)
returns void as $$
  update files set download_count = coalesce(download_count, 0) + 1 where id = file_id;
$$ language sql;
