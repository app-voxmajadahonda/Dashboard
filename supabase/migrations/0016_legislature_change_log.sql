create table if not exists legislature_change_log (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  import_job_id uuid references transparency_import_jobs(id) on delete set null,
  staging_id uuid references transparency_import_staging(id) on delete set null,
  entity_type text not null,
  target_table text not null,
  target_id uuid,
  change_type text not null check (change_type in ('create', 'update', 'deactivate', 'no_change', 'conflict')),
  old_data jsonb not null default '{}'::jsonb,
  new_data jsonb not null default '{}'::jsonb,
  source_url text,
  effective_date date not null default current_date,
  applied_by uuid references profiles(id) on delete set null,
  applied_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists legislature_change_log_legislature_idx
  on legislature_change_log (organization_id, legislature_id, applied_at desc);

create index if not exists legislature_change_log_target_idx
  on legislature_change_log (target_table, target_id, applied_at desc);

alter table legislature_change_log enable row level security;

drop policy if exists "Members can read legislature change log" on legislature_change_log;
drop policy if exists "Managers can manage legislature change log" on legislature_change_log;

create policy "Members can read legislature change log" on legislature_change_log
  for select using (is_org_member(organization_id));

create policy "Managers can manage legislature change log" on legislature_change_log
  for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));
