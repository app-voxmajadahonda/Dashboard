alter type document_kind add value if not exists 'fiscal_ordinance';
alter type document_kind add value if not exists 'delegation_decree';
alter type document_kind add value if not exists 'rom';

create table if not exists base_document_requirements (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  document_kind document_kind not null,
  title text not null,
  description text,
  required boolean not null default true,
  source_preference text not null default 'upload',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, document_kind, title)
);

alter table base_document_requirements enable row level security;

drop policy if exists "Members can read base document requirements" on base_document_requirements;
drop policy if exists "Admins can manage base document requirements" on base_document_requirements;

create policy "Members can read base document requirements"
  on base_document_requirements for select
  using (is_org_member(organization_id));

create policy "Admins can manage base document requirements"
  on base_document_requirements for all
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));

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
    )
) as item(document_kind, title, description, source_preference)
on conflict (organization_id, document_kind, title) do nothing;
