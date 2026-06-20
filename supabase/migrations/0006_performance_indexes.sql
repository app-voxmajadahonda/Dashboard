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
