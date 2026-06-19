insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'documents',
  'documents',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can read organization document files" on storage.objects;
drop policy if exists "Members can upload organization document files" on storage.objects;
drop policy if exists "Members can update organization document files" on storage.objects;
drop policy if exists "Members can delete organization document files" on storage.objects;

create policy "Members can read organization document files"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "Members can upload organization document files"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "Members can update organization document files"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "Members can delete organization document files"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and is_org_member((storage.foldername(name))[1]::uuid)
  );
