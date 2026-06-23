do $$
begin
  if not exists (select 1 from pg_type where typname = 'guided_process_status') then
    create type guided_process_status as enum (
      'started',
      'pending_review',
      'completed',
      'failed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'guided_process_type') then
    create type guided_process_type as enum (
      'import_plenary_agenda',
      'import_committee_call',
      'register_motion',
      'register_institutional_request',
      'import_minutes',
      'import_budget',
      'import_fiscal_ordinance',
      'import_crime_report',
      'import_contract'
    );
  end if;
end
$$;

create table if not exists process_runs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  process_type guided_process_type not null,
  title text not null,
  status guided_process_status not null default 'started',
  started_by uuid references profiles(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  source_document_id uuid references documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists process_runs_org_type_status_idx
  on process_runs (organization_id, process_type, status, created_at desc);

create index if not exists process_runs_related_idx
  on process_runs (organization_id, related_entity_type, related_entity_id);

alter table process_runs enable row level security;

drop policy if exists "Members can read process runs" on process_runs;
drop policy if exists "Managers can manage process runs" on process_runs;

create policy "Members can read process runs"
  on process_runs for select
  using (is_org_member(organization_id));

create policy "Managers can manage process runs"
  on process_runs for all
  using (is_org_manager(organization_id))
  with check (is_org_manager(organization_id));
