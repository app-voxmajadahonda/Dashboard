do $$
begin
  alter type guided_process_type add value if not exists 'import_transparency_portal';

  if not exists (select 1 from pg_type where typname = 'system_lock_status') then
    create type system_lock_status as enum ('active', 'released', 'expired');
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_job_status') then
    create type transparency_import_job_status as enum (
      'pending',
      'crawling',
      'downloaded',
      'extracted',
      'needs_review',
      'applied',
      'failed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_source_type') then
    create type transparency_import_source_type as enum (
      'page',
      'pdf',
      'docx',
      'xlsx',
      'videoacta',
      'external_link',
      'unknown'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_category') then
    create type transparency_import_category as enum (
      'pleno',
      'composicion_pleno',
      'grupos_municipales',
      'comisiones',
      'junta_gobierno',
      'areas_gobierno',
      'organigrama',
      'delegaciones',
      'convocatorias',
      'actas',
      'mociones',
      'videoactas',
      'otros'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_source_status') then
    create type transparency_import_source_status as enum ('discovered', 'downloaded', 'parsed', 'failed', 'ignored');
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_entity_type') then
    create type transparency_import_entity_type as enum (
      'municipal_corporation_member',
      'municipal_group',
      'government_area',
      'delegated_councillor',
      'standing_committee',
      'committee_membership',
      'plenary_regular_schedule',
      'committee_regular_schedule',
      'plenary_session',
      'committee_session',
      'government_board_member',
      'motion',
      'vote',
      'video_minutes',
      'document_reference'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_staging_status') then
    create type transparency_import_staging_status as enum ('extracted', 'matched', 'needs_review', 'approved', 'rejected', 'applied');
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_change_type') then
    create type transparency_import_change_type as enum ('create', 'update', 'deactivate', 'no_change', 'conflict');
  end if;

  if not exists (select 1 from pg_type where typname = 'transparency_import_diff_status') then
    create type transparency_import_diff_status as enum ('pending_review', 'approved', 'rejected', 'applied');
  end if;
end
$$;

create table if not exists system_locks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lock_type text not null,
  reason text not null,
  process_run_id uuid references process_runs(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  released_at timestamptz,
  status system_lock_status not null default 'active'
);

create table if not exists transparency_import_jobs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  process_run_id uuid references process_runs(id) on delete set null,
  source_url text not null,
  status transparency_import_job_status not null default 'pending',
  started_by uuid references profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table document_files
  add column if not exists checksum text;

create table if not exists transparency_import_sources (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  job_id uuid not null references transparency_import_jobs(id) on delete cascade,
  url text not null,
  title text,
  source_type transparency_import_source_type not null default 'unknown',
  category transparency_import_category not null default 'otros',
  status transparency_import_source_status not null default 'discovered',
  document_id uuid references documents(id) on delete set null,
  checksum text,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, url)
);

create table if not exists transparency_import_staging (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  job_id uuid not null references transparency_import_jobs(id) on delete cascade,
  source_id uuid references transparency_import_sources(id) on delete cascade,
  entity_type transparency_import_entity_type not null,
  extracted_data jsonb not null default '{}'::jsonb,
  matched_existing_table text,
  matched_existing_id uuid,
  confidence numeric(5, 4),
  status transparency_import_staging_status not null default 'needs_review',
  review_notes text,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transparency_import_diffs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  job_id uuid not null references transparency_import_jobs(id) on delete cascade,
  staging_id uuid references transparency_import_staging(id) on delete cascade,
  target_table text not null,
  target_id uuid,
  change_type transparency_import_change_type not null,
  current_data jsonb not null default '{}'::jsonb,
  proposed_data jsonb not null default '{}'::jsonb,
  diff_summary text,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  status transparency_import_diff_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists system_locks_org_status_idx on system_locks (organization_id, lock_type, status, expires_at);
create index if not exists document_files_checksum_idx on document_files (checksum) where checksum is not null;
create index if not exists transparency_jobs_org_status_idx on transparency_import_jobs (organization_id, status, created_at desc);
create index if not exists transparency_sources_job_category_idx on transparency_import_sources (job_id, category, status);
create index if not exists transparency_staging_job_status_idx on transparency_import_staging (job_id, entity_type, status);
create index if not exists transparency_diffs_job_status_idx on transparency_import_diffs (job_id, status, risk_level);

alter table system_locks enable row level security;
alter table transparency_import_jobs enable row level security;
alter table transparency_import_sources enable row level security;
alter table transparency_import_staging enable row level security;
alter table transparency_import_diffs enable row level security;

drop policy if exists "Members can read system locks" on system_locks;
drop policy if exists "Managers can manage system locks" on system_locks;
drop policy if exists "Members can read transparency import jobs" on transparency_import_jobs;
drop policy if exists "Managers can manage transparency import jobs" on transparency_import_jobs;
drop policy if exists "Members can read transparency import sources" on transparency_import_sources;
drop policy if exists "Managers can manage transparency import sources" on transparency_import_sources;
drop policy if exists "Members can read transparency import staging" on transparency_import_staging;
drop policy if exists "Managers can manage transparency import staging" on transparency_import_staging;
drop policy if exists "Members can read transparency import diffs" on transparency_import_diffs;
drop policy if exists "Managers can manage transparency import diffs" on transparency_import_diffs;

create policy "Members can read system locks" on system_locks for select using (is_org_member(organization_id));
create policy "Managers can manage system locks" on system_locks for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read transparency import jobs" on transparency_import_jobs for select using (is_org_member(organization_id));
create policy "Managers can manage transparency import jobs" on transparency_import_jobs for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read transparency import sources" on transparency_import_sources for select using (is_org_member(organization_id));
create policy "Managers can manage transparency import sources" on transparency_import_sources for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read transparency import staging" on transparency_import_staging for select using (is_org_member(organization_id));
create policy "Managers can manage transparency import staging" on transparency_import_staging for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read transparency import diffs" on transparency_import_diffs for select using (is_org_member(organization_id));
create policy "Managers can manage transparency import diffs" on transparency_import_diffs for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));
