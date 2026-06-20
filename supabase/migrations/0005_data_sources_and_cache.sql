create table if not exists data_sources (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_key text not null,
  label text not null,
  provider text not null,
  source_url text,
  refresh_interval_days integer not null default 30,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, source_key)
);

create table if not exists cached_external_data (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  cache_key text not null,
  provider text not null,
  source_url text,
  payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz,
  expires_at timestamptz,
  status text not null default 'fresh',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, cache_key)
);

create index if not exists data_sources_org_enabled_idx
  on data_sources (organization_id, enabled);

create index if not exists cached_external_data_org_key_idx
  on cached_external_data (organization_id, cache_key);

create index if not exists cached_external_data_expires_at_idx
  on cached_external_data (expires_at);

alter table data_sources enable row level security;
alter table cached_external_data enable row level security;

drop policy if exists "Members can read data sources" on data_sources;
drop policy if exists "Admins can manage data sources" on data_sources;
drop policy if exists "Members can read cached external data" on cached_external_data;
drop policy if exists "Admins can manage cached external data" on cached_external_data;

create policy "Members can read data sources"
  on data_sources for select
  using (is_org_member(organization_id));

create policy "Admins can manage data sources"
  on data_sources for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

create policy "Members can read cached external data"
  on cached_external_data for select
  using (is_org_member(organization_id));

create policy "Admins can manage cached external data"
  on cached_external_data for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

insert into data_sources (
  organization_id,
  source_key,
  label,
  provider,
  source_url,
  refresh_interval_days
)
select
  id,
  item.source_key,
  item.label,
  item.provider,
  item.source_url,
  item.refresh_interval_days
from organizations
cross join (
  values
    (
      'population',
      'Poblacion oficial',
      'INE',
      'https://www.ine.es/',
      30
    ),
    (
      'vox_press_posts',
      'Notas de prensa VOX por municipio',
      'VOX',
      'https://www.voxespana.es/tag/majadahonda',
      1
    ),
    (
      'municipal_website',
      'Web oficial del Ayuntamiento',
      'Ayuntamiento',
      'https://www.majadahonda.org',
      30
    ),
    (
      'transparency_portal',
      'Portal de transparencia',
      'Ayuntamiento',
      'https://www.majadahonda.org/transparencia',
      30
    )
) as item(source_key, label, provider, source_url, refresh_interval_days)
on conflict (organization_id, source_key) do nothing;

insert into cached_external_data (
  organization_id,
  cache_key,
  provider,
  source_url,
  payload,
  fetched_at,
  expires_at,
  status
)
select
  id,
  'public_profile',
  'configuration',
  null,
  jsonb_build_object(
    'note',
    'Datos publicos iniciales cacheados. Pendiente de sincronizacion automatica por fuente.'
  ),
  now(),
  now() + interval '30 days',
  'fresh'
from organizations
on conflict (organization_id, cache_key) do nothing;
