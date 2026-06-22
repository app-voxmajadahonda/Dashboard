alter type app_role add value if not exists 'spokesperson';
alter type app_role add value if not exists 'communications_manager';
alter type app_role add value if not exists 'advisor';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'data_status') then
    create type data_status as enum (
      'oficial',
      'pendiente_validacion',
      'estimado',
      'interno',
      'desactualizado'
    );
  end if;
end
$$;

create table if not exists municipal_indicators (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category text not null,
  indicator_key text not null,
  label text not null,
  value jsonb not null default '{}'::jsonb,
  unit text,
  period text,
  source_name text,
  source_url text,
  source_document_id uuid references documents(id) on delete set null,
  data_status data_status not null default 'pendiente_validacion',
  confidence text not null default 'media',
  loaded_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, category, indicator_key, period)
);

create table if not exists councillor_observations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  scope text not null,
  target_table text,
  target_id uuid,
  title text not null,
  body text,
  visibility text not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists councillor_relevance_marks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  scope text not null,
  target_table text,
  target_id uuid,
  reason text,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, scope, target_table, target_id)
);

create index if not exists municipal_indicators_org_category_idx
  on municipal_indicators (organization_id, category, period);

create index if not exists municipal_indicators_status_idx
  on municipal_indicators (organization_id, data_status);

create index if not exists councillor_observations_org_user_idx
  on councillor_observations (organization_id, user_id, created_at desc);

create index if not exists councillor_relevance_org_user_idx
  on councillor_relevance_marks (organization_id, user_id, created_at desc);

alter table municipal_indicators enable row level security;
alter table councillor_observations enable row level security;
alter table councillor_relevance_marks enable row level security;

drop policy if exists "Members can read municipal indicators" on municipal_indicators;
drop policy if exists "Admins can manage municipal indicators" on municipal_indicators;
drop policy if exists "Members can read councillor observations" on councillor_observations;
drop policy if exists "Members can create own councillor observations" on councillor_observations;
drop policy if exists "Members can update own councillor observations" on councillor_observations;
drop policy if exists "Members can read relevance marks" on councillor_relevance_marks;
drop policy if exists "Members can manage own relevance marks" on councillor_relevance_marks;

create policy "Members can read municipal indicators"
  on municipal_indicators for select
  using (is_org_member(organization_id));

create policy "Admins can manage municipal indicators"
  on municipal_indicators for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

create policy "Members can read councillor observations"
  on councillor_observations for select
  using (is_org_member(organization_id));

create policy "Members can create own councillor observations"
  on councillor_observations for insert
  with check (is_org_member(organization_id) and user_id = auth.uid());

create policy "Members can update own councillor observations"
  on councillor_observations for update
  using (is_org_member(organization_id) and user_id = auth.uid())
  with check (is_org_member(organization_id) and user_id = auth.uid());

create policy "Members can read relevance marks"
  on councillor_relevance_marks for select
  using (is_org_member(organization_id));

create policy "Members can manage own relevance marks"
  on councillor_relevance_marks for all
  using (is_org_member(organization_id) and user_id = auth.uid())
  with check (is_org_member(organization_id) and user_id = auth.uid());
