do $$
begin
  if not exists (select 1 from pg_type where typname = 'legislature_status') then
    create type legislature_status as enum ('draft', 'active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'legislature_configuration_status') then
    create type legislature_configuration_status as enum ('pending', 'in_progress', 'needs_review', 'validated');
  end if;

  if not exists (select 1 from pg_type where typname = 'legislature_document_role') then
    create type legislature_document_role as enum (
      'organization_plenary',
      'delegation_decree',
      'committee_creation',
      'municipal_rom',
      'municipal_group_composition',
      'logo',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'legislature_document_status') then
    create type legislature_document_status as enum (
      'uploaded',
      'extracting',
      'extracted',
      'needs_review',
      'validated',
      'failed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'standing_committee_type') then
    create type standing_committee_type as enum ('standing', 'special', 'accounts', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'committee_membership_role') then
    create type committee_membership_role as enum ('chair', 'vice_chair', 'member', 'substitute');
  end if;
end
$$;

create table if not exists legislatures (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status legislature_status not null default 'draft',
  configuration_status legislature_configuration_status not null default 'pending',
  created_by uuid references profiles(id) on delete set null,
  validated_by uuid references profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists legislature_documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  document_role legislature_document_role not null,
  status legislature_document_status not null default 'uploaded',
  extracted_data jsonb not null default '{}'::jsonb,
  reviewed_data jsonb not null default '{}'::jsonb,
  confidence numeric(5, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legislature_id, document_id)
);

create table if not exists municipal_corporation_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  full_name text not null,
  political_group text,
  party text,
  role text,
  is_mayor boolean not null default false,
  is_government_member boolean not null default false,
  order_number integer,
  start_date date,
  end_date date,
  active boolean not null default true,
  source_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists municipal_groups (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  name text not null,
  party text,
  spokesperson_name text,
  deputy_spokesperson_name text,
  councillors_count integer,
  votes integer,
  vote_percentage numeric(6, 3),
  seats integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legislature_id, name)
);

create table if not exists government_areas (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  name text not null,
  description text,
  delegated_councillor_id uuid references municipal_corporation_members(id) on delete set null,
  competencies jsonb not null default '[]'::jsonb,
  source_document_id uuid references documents(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legislature_id, name)
);

create table if not exists delegated_councillors (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  councillor_id uuid references municipal_corporation_members(id) on delete set null,
  area_id uuid references government_areas(id) on delete set null,
  delegation_title text not null,
  competencies jsonb not null default '[]'::jsonb,
  decree_reference text,
  start_date date,
  end_date date,
  active boolean not null default true,
  source_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists standing_committees (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  name text not null,
  description text,
  committee_type standing_committee_type not null default 'standing',
  ordinary_schedule_rule text,
  active boolean not null default true,
  source_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legislature_id, name)
);

create table if not exists committee_memberships (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  committee_id uuid not null references standing_committees(id) on delete cascade,
  councillor_id uuid references municipal_corporation_members(id) on delete set null,
  political_group text,
  role committee_membership_role not null default 'member',
  is_primary boolean not null default true,
  substitute_for_id uuid references committee_memberships(id) on delete set null,
  start_date date,
  end_date date,
  active boolean not null default true,
  source_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists plenary_regular_schedule (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  rule_description text not null,
  frequency text,
  weekday text,
  week_of_month integer,
  time time,
  exceptions jsonb not null default '[]'::jsonb,
  source_document_id uuid references documents(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists committee_regular_schedule (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  legislature_id uuid not null references legislatures(id) on delete cascade,
  committee_id uuid references standing_committees(id) on delete cascade,
  rule_description text not null,
  frequency text,
  weekday text,
  week_of_month integer,
  time time,
  exceptions jsonb not null default '[]'::jsonb,
  source_document_id uuid references documents(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists legislatures_org_status_idx
  on legislatures (organization_id, status, configuration_status);
create index if not exists legislature_documents_legislature_status_idx
  on legislature_documents (legislature_id, document_role, status);
create index if not exists corporation_members_legislature_group_idx
  on municipal_corporation_members (legislature_id, political_group, active);
create index if not exists municipal_groups_legislature_idx
  on municipal_groups (legislature_id);
create index if not exists government_areas_legislature_idx
  on government_areas (legislature_id, active);
create index if not exists delegated_councillors_legislature_idx
  on delegated_councillors (legislature_id, active);
create index if not exists standing_committees_legislature_idx
  on standing_committees (legislature_id, active);
create index if not exists committee_memberships_committee_idx
  on committee_memberships (committee_id, active);
create index if not exists plenary_schedule_legislature_idx
  on plenary_regular_schedule (legislature_id, active);
create index if not exists committee_schedule_legislature_idx
  on committee_regular_schedule (legislature_id, active);

alter table legislatures enable row level security;
alter table legislature_documents enable row level security;
alter table municipal_corporation_members enable row level security;
alter table municipal_groups enable row level security;
alter table government_areas enable row level security;
alter table delegated_councillors enable row level security;
alter table standing_committees enable row level security;
alter table committee_memberships enable row level security;
alter table plenary_regular_schedule enable row level security;
alter table committee_regular_schedule enable row level security;

drop policy if exists "Members can read legislatures" on legislatures;
drop policy if exists "Managers can manage legislatures" on legislatures;
drop policy if exists "Members can read legislature documents" on legislature_documents;
drop policy if exists "Managers can manage legislature documents" on legislature_documents;
drop policy if exists "Members can read municipal corporation members" on municipal_corporation_members;
drop policy if exists "Managers can manage municipal corporation members" on municipal_corporation_members;
drop policy if exists "Members can read municipal groups" on municipal_groups;
drop policy if exists "Managers can manage municipal groups" on municipal_groups;
drop policy if exists "Members can read government areas" on government_areas;
drop policy if exists "Managers can manage government areas" on government_areas;
drop policy if exists "Members can read delegated councillors" on delegated_councillors;
drop policy if exists "Managers can manage delegated councillors" on delegated_councillors;
drop policy if exists "Members can read standing committees" on standing_committees;
drop policy if exists "Managers can manage standing committees" on standing_committees;
drop policy if exists "Members can read committee memberships" on committee_memberships;
drop policy if exists "Managers can manage committee memberships" on committee_memberships;
drop policy if exists "Members can read plenary regular schedule" on plenary_regular_schedule;
drop policy if exists "Managers can manage plenary regular schedule" on plenary_regular_schedule;
drop policy if exists "Members can read committee regular schedule" on committee_regular_schedule;
drop policy if exists "Managers can manage committee regular schedule" on committee_regular_schedule;

create policy "Members can read legislatures" on legislatures for select using (is_org_member(organization_id));
create policy "Managers can manage legislatures" on legislatures for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read legislature documents" on legislature_documents for select using (is_org_member(organization_id));
create policy "Managers can manage legislature documents" on legislature_documents for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read municipal corporation members" on municipal_corporation_members for select using (is_org_member(organization_id));
create policy "Managers can manage municipal corporation members" on municipal_corporation_members for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read municipal groups" on municipal_groups for select using (is_org_member(organization_id));
create policy "Managers can manage municipal groups" on municipal_groups for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read government areas" on government_areas for select using (is_org_member(organization_id));
create policy "Managers can manage government areas" on government_areas for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read delegated councillors" on delegated_councillors for select using (is_org_member(organization_id));
create policy "Managers can manage delegated councillors" on delegated_councillors for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read standing committees" on standing_committees for select using (is_org_member(organization_id));
create policy "Managers can manage standing committees" on standing_committees for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read committee memberships" on committee_memberships for select using (is_org_member(organization_id));
create policy "Managers can manage committee memberships" on committee_memberships for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read plenary regular schedule" on plenary_regular_schedule for select using (is_org_member(organization_id));
create policy "Managers can manage plenary regular schedule" on plenary_regular_schedule for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));

create policy "Members can read committee regular schedule" on committee_regular_schedule for select using (is_org_member(organization_id));
create policy "Managers can manage committee regular schedule" on committee_regular_schedule for all using (is_org_manager(organization_id)) with check (is_org_manager(organization_id));
