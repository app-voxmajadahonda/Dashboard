-- PASO 2/2 - Ejecutar despues de que el PASO 1 haya terminado correctamente.
-- Incluye migraciones 0004 a 0010.



-- ============================================================
-- supabase/migrations/0004_seed_base_document_requirements.sql
-- ============================================================

insert into base_document_requirements (
  organization_id,
  document_kind,
  title,
  description,
  source_preference
)
select
  id,
  item.document_kind::document_kind,
  item.title,
  item.description,
  item.source_preference
from organizations
cross join (
  values
    (
      'fiscal_ordinance',
      'Ordenanzas fiscales',
      'PDFs oficiales de tasas, impuestos, bonificaciones, exenciones y precios publicos.',
      'upload'
    ),
    (
      'budget',
      'Presupuesto municipal',
      'Presupuesto vigente y documentacion economica asociada.',
      'official_source_or_upload'
    ),
    (
      'delegation_decree',
      'Decreto de delegaciones',
      'Delegaciones, areas de gobierno, concejalias y competencias.',
      'official_source_or_upload'
    ),
    (
      'rom',
      'ROM municipal',
      'Reglamento organico municipal, regimen de plenos, comisiones y plazos.',
      'official_source_or_upload'
    ),
    (
      'electoral_program',
      'Programa electoral',
      'Programa electoral completo para medir iniciativas, cumplimiento y alertas politicas.',
      'upload'
    ),
    (
      'strategic_plan',
      'Plan estrategico',
      'Objetivos politicos, lineas de actuacion y prioridades anuales del grupo municipal.',
      'upload'
    ),
    (
      'communication_plan',
      'Plan de comunicacion',
      'Mensajes, campanas, canales, calendario y objetivos de comunicacion politica.',
      'upload'
    )
) as item(document_kind, title, description, source_preference)
on conflict (organization_id, document_kind, title) do nothing;


-- ============================================================
-- supabase/migrations/0005_data_sources_and_cache.sql
-- ============================================================

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


-- ============================================================
-- supabase/migrations/0006_performance_indexes.sql
-- ============================================================

create index if not exists memberships_org_user_active_idx
  on memberships (organization_id, user_id, active);

create index if not exists documents_org_status_kind_created_idx
  on documents (organization_id, processing_status, kind, created_at desc);

create index if not exists documents_org_official_date_idx
  on documents (organization_id, official_date desc)
  where official_date is not null;

create index if not exists document_files_document_id_idx
  on document_files (document_id);

create index if not exists document_extractions_document_id_created_idx
  on document_extractions (document_id, created_at desc);

create index if not exists government_actions_org_status_risk_date_idx
  on government_actions (organization_id, follow_up_status, risk_level, official_date desc);

create index if not exists government_actions_org_area_idx
  on government_actions (organization_id, area);

create index if not exists audit_log_org_created_idx
  on audit_log (organization_id, created_at desc);

create index if not exists base_document_requirements_org_kind_idx
  on base_document_requirements (organization_id, document_kind);


-- ============================================================
-- supabase/migrations/0007_user_profile_settings.sql
-- ============================================================

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


-- ============================================================
-- supabase/migrations/0008_councillor_dashboard_foundation.sql
-- ============================================================

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


-- ============================================================
-- supabase/migrations/0009_data_freshness_controls.sql
-- ============================================================

alter table municipal_indicators
  add column if not exists source_key text,
  add column if not exists expires_at timestamptz;

create index if not exists municipal_indicators_expires_at_idx
  on municipal_indicators (organization_id, expires_at);

create index if not exists municipal_indicators_source_key_idx
  on municipal_indicators (organization_id, source_key);

update municipal_indicators indicator
set
  source_key = coalesce(indicator.source_key, source.source_key),
  expires_at = coalesce(indicator.expires_at, indicator.updated_at + (source.refresh_interval_days || ' days')::interval)
from data_sources source
where
  indicator.organization_id = source.organization_id
  and indicator.source_name is not null
  and lower(indicator.source_name) = lower(source.provider)
  and indicator.expires_at is null;


-- ============================================================
-- supabase/migrations/0010_data_catalog.sql
-- ============================================================

create table if not exists data_catalog_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  data_key text not null,
  display_name text not null,
  dashboard_tab text not null,
  dashboard_section text not null,
  data_path text not null,
  source_type text not null default 'pendiente_fuente',
  preferred_source text not null,
  source_url text,
  fallback_source text,
  automation_level text not null default 'manual',
  refresh_interval_days integer,
  target_table text not null default 'municipal_indicators',
  target_indicator_key text not null,
  validation_role text not null default 'spokesperson',
  status text not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, data_key)
);

create index if not exists data_catalog_items_org_tab_idx
  on data_catalog_items (organization_id, dashboard_tab, dashboard_section);

create index if not exists data_catalog_items_source_type_idx
  on data_catalog_items (organization_id, source_type, status);

alter table data_catalog_items enable row level security;

drop policy if exists "Members can read data catalog" on data_catalog_items;
drop policy if exists "Admins can manage data catalog" on data_catalog_items;

create policy "Members can read data catalog"
  on data_catalog_items for select
  using (is_org_member(organization_id));

create policy "Admins can manage data catalog"
  on data_catalog_items for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

insert into data_catalog_items (
  organization_id,
  data_key,
  display_name,
  dashboard_tab,
  dashboard_section,
  data_path,
  source_type,
  preferred_source,
  source_url,
  fallback_source,
  automation_level,
  refresh_interval_days,
  target_indicator_key,
  status,
  notes
)
select
  organizations.id,
  item.data_key,
  item.display_name,
  item.dashboard_tab,
  item.dashboard_section,
  item.data_path,
  item.source_type,
  item.preferred_source,
  item.source_url,
  item.fallback_source,
  item.automation_level,
  item.refresh_interval_days,
  item.target_indicator_key,
  item.status,
  item.notes
from organizations
cross join (
  values
    ('total_population', 'PoblaciÃ³n total', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > KPIs > PoblaciÃ³n total', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'Carga manual desde INE', 'automatic', 90, 'total_population', 'verificado', 'Majadahonda cÃ³digo INE 28080. Total 2025 localizado: 73625.'),
    ('population_evolution', 'EvoluciÃ³n de poblaciÃ³n', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > EvoluciÃ³n poblaciÃ³n', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'CSV/Excel INE', 'automatic', 90, 'population_evolution', 'verificado_fuente', null),
    ('population_by_sex', 'PoblaciÃ³n por sexo', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > DemografÃ­a', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'CSV/Excel INE', 'automatic', 90, 'population_by_sex', 'verificado_fuente', null),
    ('population_by_age', 'PoblaciÃ³n por edad', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > PoblaciÃ³n por edad', 'pendiente_fuente', 'INE / Comunidad de Madrid', null, 'Carga manual', 'pending', 90, 'population_by_age', 'pendiente', null),
    ('average_age', 'Edad media', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > DemografÃ­a detallada', 'pendiente_fuente', 'INE / Comunidad de Madrid', null, 'Carga manual', 'pending', 90, 'average_age', 'pendiente', null),
    ('foreign_population_total', 'PoblaciÃ³n extranjera total', 'Datos generales', 'DemografÃ­a', '/concejal#datos-generales > DemografÃ­a detallada', 'pendiente_fuente', 'INE padrÃ³n', null, 'Carga manual', 'pending', 90, 'foreign_population_total', 'pendiente', null),
    ('average_household_income', 'Renta media por hogar', 'Datos generales', 'SocioeconomÃ­a', '/concejal#datos-generales > KPI renta', 'pendiente_fuente', 'INE / AEAT', null, 'Carga manual', 'pending', 365, 'average_household_income', 'pendiente', null),
    ('unemployment_rate', 'Tasa de paro', 'Datos generales', 'SocioeconomÃ­a', '/concejal#datos-generales > Datos socioeconÃ³micos', 'pendiente_fuente', 'SEPE / Comunidad de Madrid', null, 'Carga manual', 'pending', 30, 'unemployment_rate', 'pendiente', null),
    ('education_centers', 'Centros educativos', 'Datos generales', 'Servicios', '/concejal#datos-generales > Servicios', 'carga_manual', 'Ayuntamiento / Comunidad de Madrid', null, 'Carga manual', 'manual', 365, 'education_centers', 'pendiente', null),
    ('mayor', 'Alcalde', 'Datos generales', 'Ficha polÃ­tica', '/concejal#datos-generales > Ficha polÃ­tica', 'documento_oficial', 'Decreto/acta constituciÃ³n', null, 'Carga manual', 'document', null, 'mayor', 'pendiente', 'Dato de legislatura.'),
    ('council_composition', 'ComposiciÃ³n del pleno', 'Datos generales', 'Ficha polÃ­tica', '/concejal#datos-generales > Ficha polÃ­tica', 'documento_oficial', 'Junta Electoral / acta constituciÃ³n', null, 'Carga manual', 'document', null, 'council_composition', 'pendiente', 'Dato de legislatura.'),
    ('delegated_councillors', 'Concejales delegados', 'Control institucional', 'OrganizaciÃ³n municipal', '/concejal#control-institucional', 'documento_oficial', 'Decreto de delegaciones', null, 'Carga PDF', 'document', null, 'delegated_councillors', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('committees', 'Comisiones creadas', 'Control institucional', 'Comisiones', '/concejal#control-institucional', 'documento_oficial', 'Acuerdo plenario / ROM', null, 'Carga PDF', 'document', null, 'committees', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('committee_members', 'Miembros de comisiones', 'Control institucional', 'Comisiones', '/concejal#control-institucional', 'documento_oficial', 'Acuerdo plenario', null, 'Carga PDF', 'document', null, 'committee_members', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('plenary_calendar', 'Calendario de plenos', 'Control institucional', 'Calendario', 'Barra derecha calendario', 'documento_oficial', 'ROM / calendario municipal', null, 'Carga manual', 'document', 30, 'plenary_calendar', 'pendiente', null),
    ('motion_deadlines', 'Plazos de mociones', 'Control institucional', 'Plazos', 'Barra derecha alertas', 'documento_oficial', 'ROM municipal', null, 'Carga PDF', 'document', null, 'motion_deadlines', 'pendiente', null),
    ('vote_patterns', 'Votaciones por grupo', 'Control institucional', 'Votaciones', '/concejal#control-institucional', 'documento_oficial', 'Actas de pleno', null, 'Carga PDF', 'document', null, 'vote_patterns', 'pendiente', 'Se actualiza por pleno.'),
    ('total_budget', 'Presupuesto total', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'documento_oficial', 'Presupuesto municipal PDF/Excel', null, 'Carga manual', 'document', 365, 'total_budget', 'pendiente', null),
    ('budget_per_capita', 'Presupuesto por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Presupuesto + poblaciÃ³n', null, null, 'calculated', null, 'budget_per_capita', 'pendiente', 'Caduca segÃºn entradas.'),
    ('current_spending_per_capita', 'Gasto corriente por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Presupuesto + poblaciÃ³n', null, null, 'calculated', null, 'current_spending_per_capita', 'pendiente', 'Caduca segÃºn entradas.'),
    ('debt_per_capita', 'Deuda por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Deuda + poblaciÃ³n', null, 'Carga manual', 'calculated', 365, 'debt_per_capita', 'pendiente', null),
    ('ibi_rate', 'IBI', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IBI', null, 'Carga PDF', 'document', 365, 'ibi_rate', 'pendiente', null),
    ('ivtm_rates', 'IVTM', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IVTM', null, 'Carga PDF', 'document', 365, 'ivtm_rates', 'pendiente', null),
    ('icio_rate', 'ICIO', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal ICIO', null, 'Carga PDF', 'document', 365, 'icio_rate', 'pendiente', null),
    ('iivtnu_rates', 'PlusvalÃ­a', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IIVTNU', null, 'Carga PDF', 'document', 365, 'iivtnu_rates', 'pendiente', null),
    ('waste_tax', 'Tasa de basuras', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza/tasa', null, 'Carga PDF', 'document', 365, 'waste_tax', 'pendiente', null),
    ('open_contracts', 'Contratos abiertos', 'Seguimiento de contratos', 'ContrataciÃ³n', '/concejal#contratos', 'pendiente_fuente', 'Plataforma de ContrataciÃ³n', null, 'Carga documental', 'pending', 7, 'open_contracts', 'pendiente', null),
    ('awarded_contracts', 'Adjudicaciones', 'Seguimiento de contratos', 'ContrataciÃ³n', '/concejal#contratos', 'pendiente_fuente', 'Plataforma de ContrataciÃ³n', null, 'Carga documental', 'pending', 7, 'awarded_contracts', 'pendiente', null),
    ('priority_projects', 'Proyectos prioritarios', 'Seguimiento de proyectos especiales', 'Proyectos', '/concejal#proyectos', 'carga_manual', 'Ayuntamiento / presupuesto / expedientes', null, 'Carga manual', 'manual', 30, 'priority_projects', 'pendiente', null),
    ('project_milestones', 'Hitos de proyectos', 'Seguimiento de proyectos especiales', 'Hitos', '/concejal#proyectos', 'carga_manual', 'Expedientes / actas', null, 'Carga manual', 'manual', 30, 'project_milestones', 'pendiente', null),
    ('election_2019_results', 'Resultados electorales 2019', 'AnÃ¡lisis electoral', 'Resultados', '/concejal#analisis-electoral', 'pendiente_fuente', 'Ministerio Interior / Junta Electoral', null, 'Carga manual', 'pending', null, 'election_2019_results', 'pendiente', 'Sin caducidad.'),
    ('election_2023_results', 'Resultados electorales 2023', 'AnÃ¡lisis electoral', 'Resultados', '/concejal#analisis-electoral', 'pendiente_fuente', 'Ministerio Interior / Junta Electoral', null, 'Carga manual', 'pending', null, 'election_2023_results', 'pendiente', 'Sin caducidad.'),
    ('vox_electoral_evolution', 'EvoluciÃ³n electoral VOX', 'AnÃ¡lisis electoral', 'VOX', '/concejal#analisis-electoral', 'calculo_interno', 'Resultados electorales', null, null, 'calculated', null, 'vox_electoral_evolution', 'pendiente', 'Sin caducidad.'),
    ('electoral_program_measures', 'Programa electoral', 'Promesas electorales', 'Programa', '/concejal#promesas-electorales', 'documento_oficial', 'Programa electoral PDF', null, 'Carga PDF', 'document', null, 'electoral_program_measures', 'pendiente', 'Sin caducidad.'),
    ('program_measures_without_actions', 'Medidas sin iniciativa', 'Promesas electorales', 'Seguimiento', '/concejal#promesas-electorales', 'calculo_interno', 'Programa + iniciativas', null, null, 'calculated', 30, 'program_measures_without_actions', 'pendiente', null),
    ('local_police_staff', 'Plantilla PolicÃ­a Local', 'Datos generales', 'Seguridad', 'Futuro bloque seguridad', 'documento_oficial', 'Presupuesto/RPT/plantilla', null, 'Carga PDF', 'document', 90, 'local_police_staff', 'pendiente', null),
    ('police_ratio_per_1000', 'Ratio policÃ­as por 1.000 habitantes', 'Datos generales', 'Seguridad', 'Futuro bloque seguridad', 'calculo_interno', 'Plantilla + poblaciÃ³n', null, null, 'calculated', null, 'police_ratio_per_1000', 'pendiente', 'Caduca segÃºn entradas.'),
    ('quarterly_crime', 'Criminalidad trimestral', 'Datos generales', 'Seguridad', 'Futuro bloque seguridad', 'documento_oficial', 'Ministerio Interior', null, 'Carga PDF/CSV', 'document', 120, 'quarterly_crime', 'pendiente', null)
) as item(
  data_key,
  display_name,
  dashboard_tab,
  dashboard_section,
  data_path,
  source_type,
  preferred_source,
  source_url,
  fallback_source,
  automation_level,
  refresh_interval_days,
  target_indicator_key,
  status,
  notes
)
on conflict (organization_id, data_key) do update set
  display_name = excluded.display_name,
  dashboard_tab = excluded.dashboard_tab,
  dashboard_section = excluded.dashboard_section,
  data_path = excluded.data_path,
  source_type = excluded.source_type,
  preferred_source = excluded.preferred_source,
  source_url = excluded.source_url,
  fallback_source = excluded.fallback_source,
  automation_level = excluded.automation_level,
  refresh_interval_days = excluded.refresh_interval_days,
  target_indicator_key = excluded.target_indicator_key,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now();

