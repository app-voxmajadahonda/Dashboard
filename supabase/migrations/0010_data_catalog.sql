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
    ('total_population', 'Población total', 'Datos generales', 'Demografía', '/concejal#datos-generales > KPIs > Población total', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'Carga manual desde INE', 'automatic', 90, 'total_population', 'verificado', 'Majadahonda código INE 28080. Total 2025 localizado: 73625.'),
    ('population_evolution', 'Evolución de población', 'Datos generales', 'Demografía', '/concejal#datos-generales > Evolución población', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'CSV/Excel INE', 'automatic', 90, 'population_evolution', 'verificado_fuente', null),
    ('population_by_sex', 'Población por sexo', 'Datos generales', 'Demografía', '/concejal#datos-generales > Demografía', 'api_oficial', 'INE tabla 2881 JSON', 'https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM', 'CSV/Excel INE', 'automatic', 90, 'population_by_sex', 'verificado_fuente', null),
    ('population_by_age', 'Población por edad', 'Datos generales', 'Demografía', '/concejal#datos-generales > Población por edad', 'pendiente_fuente', 'INE / Comunidad de Madrid', null, 'Carga manual', 'pending', 90, 'population_by_age', 'pendiente', null),
    ('average_age', 'Edad media', 'Datos generales', 'Demografía', '/concejal#datos-generales > Demografía detallada', 'pendiente_fuente', 'INE / Comunidad de Madrid', null, 'Carga manual', 'pending', 90, 'average_age', 'pendiente', null),
    ('foreign_population_total', 'Población extranjera total', 'Datos generales', 'Demografía', '/concejal#datos-generales > Demografía detallada', 'pendiente_fuente', 'INE padrón', null, 'Carga manual', 'pending', 90, 'foreign_population_total', 'pendiente', null),
    ('average_household_income', 'Renta media por hogar', 'Datos generales', 'Socioeconomía', '/concejal#datos-generales > KPI renta', 'pendiente_fuente', 'INE / AEAT', null, 'Carga manual', 'pending', 365, 'average_household_income', 'pendiente', null),
    ('unemployment_rate', 'Tasa de paro', 'Datos generales', 'Socioeconomía', '/concejal#datos-generales > Datos socioeconómicos', 'pendiente_fuente', 'SEPE / Comunidad de Madrid', null, 'Carga manual', 'pending', 30, 'unemployment_rate', 'pendiente', null),
    ('education_centers', 'Centros educativos', 'Datos generales', 'Servicios', '/concejal#datos-generales > Servicios', 'carga_manual', 'Ayuntamiento / Comunidad de Madrid', null, 'Carga manual', 'manual', 365, 'education_centers', 'pendiente', null),
    ('mayor', 'Alcalde', 'Datos generales', 'Ficha política', '/concejal#datos-generales > Ficha política', 'documento_oficial', 'Decreto/acta constitución', null, 'Carga manual', 'document', null, 'mayor', 'pendiente', 'Dato de legislatura.'),
    ('council_composition', 'Composición del pleno', 'Datos generales', 'Ficha política', '/concejal#datos-generales > Ficha política', 'documento_oficial', 'Junta Electoral / acta constitución', null, 'Carga manual', 'document', null, 'council_composition', 'pendiente', 'Dato de legislatura.'),
    ('delegated_councillors', 'Concejales delegados', 'Control institucional', 'Organización municipal', '/concejal#control-institucional', 'documento_oficial', 'Decreto de delegaciones', null, 'Carga PDF', 'document', null, 'delegated_councillors', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('committees', 'Comisiones creadas', 'Control institucional', 'Comisiones', '/concejal#control-institucional', 'documento_oficial', 'Acuerdo plenario / ROM', null, 'Carga PDF', 'document', null, 'committees', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('committee_members', 'Miembros de comisiones', 'Control institucional', 'Comisiones', '/concejal#control-institucional', 'documento_oficial', 'Acuerdo plenario', null, 'Carga PDF', 'document', null, 'committee_members', 'pendiente', 'Dato de legislatura o cuando haya cambio.'),
    ('plenary_calendar', 'Calendario de plenos', 'Control institucional', 'Calendario', 'Barra derecha calendario', 'documento_oficial', 'ROM / calendario municipal', null, 'Carga manual', 'document', 30, 'plenary_calendar', 'pendiente', null),
    ('motion_deadlines', 'Plazos de mociones', 'Control institucional', 'Plazos', 'Barra derecha alertas', 'documento_oficial', 'ROM municipal', null, 'Carga PDF', 'document', null, 'motion_deadlines', 'pendiente', null),
    ('vote_patterns', 'Votaciones por grupo', 'Control institucional', 'Votaciones', '/concejal#control-institucional', 'documento_oficial', 'Actas de pleno', null, 'Carga PDF', 'document', null, 'vote_patterns', 'pendiente', 'Se actualiza por pleno.'),
    ('total_budget', 'Presupuesto total', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'documento_oficial', 'Presupuesto municipal PDF/Excel', null, 'Carga manual', 'document', 365, 'total_budget', 'pendiente', null),
    ('budget_per_capita', 'Presupuesto por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Presupuesto + población', null, null, 'calculated', null, 'budget_per_capita', 'pendiente', 'Caduca según entradas.'),
    ('current_spending_per_capita', 'Gasto corriente por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Presupuesto + población', null, null, 'calculated', null, 'current_spending_per_capita', 'pendiente', 'Caduca según entradas.'),
    ('debt_per_capita', 'Deuda por habitante', 'Fiscalidad y presupuesto', 'Presupuesto', '/concejal#fiscalidad-presupuesto > KPIs', 'calculo_interno', 'Deuda + población', null, 'Carga manual', 'calculated', 365, 'debt_per_capita', 'pendiente', null),
    ('ibi_rate', 'IBI', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IBI', null, 'Carga PDF', 'document', 365, 'ibi_rate', 'pendiente', null),
    ('ivtm_rates', 'IVTM', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IVTM', null, 'Carga PDF', 'document', 365, 'ivtm_rates', 'pendiente', null),
    ('icio_rate', 'ICIO', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal ICIO', null, 'Carga PDF', 'document', 365, 'icio_rate', 'pendiente', null),
    ('iivtnu_rates', 'Plusvalía', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza fiscal IIVTNU', null, 'Carga PDF', 'document', 365, 'iivtnu_rates', 'pendiente', null),
    ('waste_tax', 'Tasa de basuras', 'Fiscalidad y presupuesto', 'Ordenanzas', '/concejal#fiscalidad-presupuesto > Fiscalidad', 'documento_oficial', 'Ordenanza/tasa', null, 'Carga PDF', 'document', 365, 'waste_tax', 'pendiente', null),
    ('open_contracts', 'Contratos abiertos', 'Seguimiento de contratos', 'Contratación', '/concejal#contratos', 'pendiente_fuente', 'Plataforma de Contratación', null, 'Carga documental', 'pending', 7, 'open_contracts', 'pendiente', null),
    ('awarded_contracts', 'Adjudicaciones', 'Seguimiento de contratos', 'Contratación', '/concejal#contratos', 'pendiente_fuente', 'Plataforma de Contratación', null, 'Carga documental', 'pending', 7, 'awarded_contracts', 'pendiente', null),
    ('priority_projects', 'Proyectos prioritarios', 'Seguimiento de proyectos especiales', 'Proyectos', '/concejal#proyectos', 'carga_manual', 'Ayuntamiento / presupuesto / expedientes', null, 'Carga manual', 'manual', 30, 'priority_projects', 'pendiente', null),
    ('project_milestones', 'Hitos de proyectos', 'Seguimiento de proyectos especiales', 'Hitos', '/concejal#proyectos', 'carga_manual', 'Expedientes / actas', null, 'Carga manual', 'manual', 30, 'project_milestones', 'pendiente', null),
    ('election_2019_results', 'Resultados electorales 2019', 'Análisis electoral', 'Resultados', '/concejal#analisis-electoral', 'pendiente_fuente', 'Ministerio Interior / Junta Electoral', null, 'Carga manual', 'pending', null, 'election_2019_results', 'pendiente', 'Sin caducidad.'),
    ('election_2023_results', 'Resultados electorales 2023', 'Análisis electoral', 'Resultados', '/concejal#analisis-electoral', 'pendiente_fuente', 'Ministerio Interior / Junta Electoral', null, 'Carga manual', 'pending', null, 'election_2023_results', 'pendiente', 'Sin caducidad.'),
    ('vox_electoral_evolution', 'Evolución electoral VOX', 'Análisis electoral', 'VOX', '/concejal#analisis-electoral', 'calculo_interno', 'Resultados electorales', null, null, 'calculated', null, 'vox_electoral_evolution', 'pendiente', 'Sin caducidad.'),
    ('electoral_program_measures', 'Programa electoral', 'Promesas electorales', 'Programa', '/concejal#promesas-electorales', 'documento_oficial', 'Programa electoral PDF', null, 'Carga PDF', 'document', null, 'electoral_program_measures', 'pendiente', 'Sin caducidad.'),
    ('program_measures_without_actions', 'Medidas sin iniciativa', 'Promesas electorales', 'Seguimiento', '/concejal#promesas-electorales', 'calculo_interno', 'Programa + iniciativas', null, null, 'calculated', 30, 'program_measures_without_actions', 'pendiente', null),
    ('local_police_staff', 'Plantilla Policía Local', 'Datos generales', 'Seguridad', 'Futuro bloque seguridad', 'documento_oficial', 'Presupuesto/RPT/plantilla', null, 'Carga PDF', 'document', 90, 'local_police_staff', 'pendiente', null),
    ('police_ratio_per_1000', 'Ratio policías por 1.000 habitantes', 'Datos generales', 'Seguridad', 'Futuro bloque seguridad', 'calculo_interno', 'Plantilla + población', null, null, 'calculated', null, 'police_ratio_per_1000', 'pendiente', 'Caduca según entradas.'),
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
