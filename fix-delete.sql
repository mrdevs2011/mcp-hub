-- MRdrive: fix "Delete does nothing"
-- Supabase Dashboard -> SQL Editor -> run this file.
-- Safe to run multiple times: it drops and re-creates only the delete policies.

alter table files enable row level security;

drop policy if exists "users delete own files" on files;
create policy "users delete own files"
  on files for delete
  using (auth.uid() = user_id);

drop policy if exists "users delete own folder" on storage.objects;
create policy "users delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
