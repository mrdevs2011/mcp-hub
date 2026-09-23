-- MRdrive setup
-- Supabase Dashboard -> SQL Editor -> run this file

create table if not exists files (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) not null,
  filename text not null,
  storage_path text not null,
  size bigint,
  uploaded_at timestamptz default now()
);

alter table files enable row level security;

create policy "users select own files"
  on files for select
  using (auth.uid() = user_id);

create policy "users insert own files"
  on files for insert
  with check (auth.uid() = user_id);

create policy "users delete own files"
  on files for delete
  using (auth.uid() = user_id);

-- STORAGE: Dashboard -> Storage -> "New bucket" -> name: files -> set it to Private
-- Then add the policies below in Storage -> Policies, or right here:

create policy "users upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users read own folder"
  on storage.objects for select
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
