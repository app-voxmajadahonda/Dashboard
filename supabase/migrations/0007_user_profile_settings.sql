alter table profiles
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists position text,
  add column if not exists public_role text,
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists committees jsonb not null default '[]'::jsonb,
  add column if not exists responsibilities jsonb not null default '[]'::jsonb,
  add column if not exists profile_settings jsonb not null default '{}'::jsonb;

create index if not exists profiles_email_idx
  on profiles (email);
