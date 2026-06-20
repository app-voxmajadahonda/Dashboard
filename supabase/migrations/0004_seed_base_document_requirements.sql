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
