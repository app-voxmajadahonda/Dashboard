export type AppRole =
  | "admin"
  | "councillor"
  | "api_integration"
  | "spokesperson"
  | "communications_manager"
  | "advisor";

export type DataStatus =
  | "oficial"
  | "pendiente_validacion"
  | "estimado"
  | "interno"
  | "desactualizado";

export type DocumentKind =
  | "decree"
  | "fiscal_ordinance"
  | "delegation_decree"
  | "rom"
  | "electoral_program"
  | "strategic_plan"
  | "communication_plan"
  | "plenary_agreement"
  | "government_board_agreement"
  | "agenda"
  | "minutes"
  | "motion"
  | "amendment"
  | "committee"
  | "contract"
  | "report"
  | "budget"
  | "agreement"
  | "grant"
  | "other";

export type ProcessingStatus =
  | "uploaded"
  | "text_extracted"
  | "ai_extracted"
  | "needs_review"
  | "validated"
  | "failed";

export type Organization = {
  id: string;
  slug: string;
  name: string;
  party: string;
  municipality: string;
  province: string;
  region: string;
};

export type OperationalPriority = "low" | "medium" | "high" | "critical";

export type AlertStatus = "open" | "in_review" | "resolved" | "dismissed";

export type TaskStatus = "pending" | "in_progress" | "blocked" | "completed" | "cancelled";

export type CalendarEventType =
  | "pleno"
  | "comision"
  | "junta_portavoces"
  | "consejo"
  | "reunion"
  | "acto"
  | "plazo"
  | "otro";

export type CalendarEventStatus = "scheduled" | "held" | "cancelled" | "pending_minutes" | "closed";

export type PlenarySessionType = "ordinary" | "extraordinary" | "urgent";

export type PlenarySessionStatus =
  | "scheduled"
  | "held"
  | "pending_minutes"
  | "minutes_approved"
  | "closed";

export type CommitteeSessionStatus = "scheduled" | "held" | "pending_report" | "closed";

export type MotionStatus =
  | "draft"
  | "registered"
  | "debated"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "follow_up";

export type InstitutionalRequestType =
  | "question"
  | "oral_question"
  | "written_question"
  | "request"
  | "information_request"
  | "file_request"
  | "appearance_request"
  | "spokesperson_board_request"
  | "appeal";

export type InstitutionalRequestStatus =
  | "draft"
  | "registered"
  | "pending_response"
  | "answered"
  | "overdue"
  | "reiterated"
  | "closed"
  | "appealed";

export type VoteItemType = "motion" | "amendment" | "agreement" | "ordinance" | "budget" | "other";

export type GuidedProcessType =
  | "import_plenary_agenda"
  | "import_committee_call"
  | "import_transparency_portal"
  | "register_motion"
  | "register_institutional_request"
  | "import_minutes"
  | "import_budget"
  | "import_fiscal_ordinance"
  | "import_crime_report"
  | "import_contract";

export type GuidedProcessStatus = "started" | "pending_review" | "completed" | "failed" | "cancelled";

export type LegislatureStatus = "draft" | "active" | "archived";

export type LegislatureConfigurationStatus = "pending" | "in_progress" | "needs_review" | "validated";

export type LegislatureDocumentRole =
  | "organization_plenary"
  | "delegation_decree"
  | "committee_creation"
  | "municipal_rom"
  | "municipal_group_composition"
  | "logo"
  | "other";

export type LegislatureDocumentStatus = "uploaded" | "extracting" | "extracted" | "needs_review" | "validated" | "failed";

export type StandingCommitteeType = "standing" | "special" | "accounts" | "other";

export type CommitteeMembershipRole = "chair" | "vice_chair" | "member" | "substitute";

export type SystemLockStatus = "active" | "released" | "expired";

export type TransparencyImportJobStatus =
  | "pending"
  | "crawling"
  | "downloaded"
  | "extracted"
  | "needs_review"
  | "applied"
  | "failed"
  | "cancelled";

export type TransparencyImportSourceType = "page" | "pdf" | "docx" | "xlsx" | "videoacta" | "external_link" | "unknown";

export type TransparencyImportCategory =
  | "pleno"
  | "composicion_pleno"
  | "grupos_municipales"
  | "comisiones"
  | "junta_gobierno"
  | "areas_gobierno"
  | "organigrama"
  | "delegaciones"
  | "convocatorias"
  | "actas"
  | "mociones"
  | "videoactas"
  | "otros";

export type TransparencyImportSourceStatus = "discovered" | "downloaded" | "parsed" | "failed" | "ignored";

export type TransparencyImportEntityType =
  | "municipal_corporation_member"
  | "municipal_group"
  | "government_area"
  | "delegated_councillor"
  | "standing_committee"
  | "committee_membership"
  | "plenary_regular_schedule"
  | "committee_regular_schedule"
  | "plenary_session"
  | "committee_session"
  | "government_board_member"
  | "motion"
  | "vote"
  | "video_minutes"
  | "document_reference";

export type TransparencyImportStagingStatus = "extracted" | "matched" | "needs_review" | "approved" | "rejected" | "applied";

export type TransparencyImportChangeType = "create" | "update" | "deactivate" | "no_change" | "conflict";

export type TransparencyImportDiffStatus = "pending_review" | "approved" | "rejected" | "applied";

export type Alert = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: OperationalPriority;
  status: AlertStatus;
  due_at: string | null;
  created_by: string | null;
  assigned_to: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  recommended_action: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: OperationalPriority;
  assigned_to: string | null;
  created_by: string | null;
  due_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEvent = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: CalendarEventStatus;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlenarySession = {
  id: string;
  organization_id: string;
  title: string;
  session_type: PlenarySessionType;
  session_date: string;
  status: PlenarySessionStatus;
  agenda_document_id: string | null;
  minutes_document_id: string | null;
  video_url: string | null;
  internal_report: string | null;
  political_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type Committee = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  responsible_councillor_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CommitteeSession = {
  id: string;
  organization_id: string;
  committee_id: string | null;
  title: string;
  session_date: string;
  status: CommitteeSessionStatus;
  agenda_document_id: string | null;
  internal_report: string | null;
  created_at: string;
  updated_at: string;
};

export type Motion = {
  id: string;
  organization_id: string;
  title: string;
  strategic_axis: string | null;
  responsible_councillor_id: string | null;
  plenary_session_id: string | null;
  status: MotionStatus;
  registered_at: string | null;
  result: string | null;
  vote_summary: Record<string, unknown>;
  document_id: string | null;
  speech_notes: string | null;
  press_notes: string | null;
  follow_up_status: string | null;
  created_at: string;
  updated_at: string;
};

export type InstitutionalRequest = {
  id: string;
  organization_id: string;
  request_type: InstitutionalRequestType;
  title: string;
  description: string | null;
  area: string | null;
  responsible_councillor_id: string | null;
  target_body: string | null;
  registered_at: string | null;
  due_at: string | null;
  answered_at: string | null;
  status: InstitutionalRequestStatus;
  response_summary: string | null;
  document_id: string | null;
  response_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  organization_id: string;
  plenary_session_id: string | null;
  item_title: string;
  item_type: VoteItemType;
  vox_vote: string | null;
  pp_vote: string | null;
  psoe_vote: string | null;
  vecinos_vote: string | null;
  mas_madrid_vote: string | null;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProcessRun = {
  id: string;
  organization_id: string;
  process_type: GuidedProcessType;
  title: string;
  status: GuidedProcessStatus;
  started_by: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  source_document_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Legislature = {
  id: string;
  organization_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: LegislatureStatus;
  configuration_status: LegislatureConfigurationStatus;
  created_by: string | null;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LegislatureDocument = {
  id: string;
  organization_id: string;
  legislature_id: string;
  document_id: string;
  document_role: LegislatureDocumentRole;
  status: LegislatureDocumentStatus;
  extracted_data: Record<string, unknown>;
  reviewed_data: Record<string, unknown>;
  confidence: number | null;
  created_at: string;
  updated_at: string;
};

export type MunicipalCorporationMember = {
  id: string;
  organization_id: string;
  legislature_id: string;
  full_name: string;
  political_group: string | null;
  party: string | null;
  role: string | null;
  is_mayor: boolean;
  is_government_member: boolean;
  order_number: number | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  source_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MunicipalGroup = {
  id: string;
  organization_id: string;
  legislature_id: string;
  name: string;
  party: string | null;
  spokesperson_name: string | null;
  deputy_spokesperson_name: string | null;
  councillors_count: number | null;
  votes: number | null;
  vote_percentage: number | null;
  seats: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type GovernmentArea = {
  id: string;
  organization_id: string;
  legislature_id: string;
  name: string;
  description: string | null;
  delegated_councillor_id: string | null;
  competencies: unknown[];
  source_document_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type DelegatedCouncillor = {
  id: string;
  organization_id: string;
  legislature_id: string;
  councillor_id: string | null;
  area_id: string | null;
  delegation_title: string;
  competencies: unknown[];
  decree_reference: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  source_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type StandingCommittee = {
  id: string;
  organization_id: string;
  legislature_id: string;
  name: string;
  description: string | null;
  committee_type: StandingCommitteeType;
  ordinary_schedule_rule: string | null;
  active: boolean;
  source_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CommitteeMembership = {
  id: string;
  organization_id: string;
  legislature_id: string;
  committee_id: string;
  councillor_id: string | null;
  political_group: string | null;
  role: CommitteeMembershipRole;
  is_primary: boolean;
  substitute_for_id: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  source_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PlenaryRegularSchedule = {
  id: string;
  organization_id: string;
  legislature_id: string;
  rule_description: string;
  frequency: string | null;
  weekday: string | null;
  week_of_month: number | null;
  time: string | null;
  exceptions: unknown[];
  source_document_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CommitteeRegularSchedule = {
  id: string;
  organization_id: string;
  legislature_id: string;
  committee_id: string | null;
  rule_description: string;
  frequency: string | null;
  weekday: string | null;
  week_of_month: number | null;
  time: string | null;
  exceptions: unknown[];
  source_document_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SystemLock = {
  id: string;
  organization_id: string;
  lock_type: string;
  reason: string;
  process_run_id: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string;
  released_at: string | null;
  status: SystemLockStatus;
};

export type TransparencyImportJob = {
  id: string;
  organization_id: string;
  legislature_id: string;
  process_run_id: string | null;
  source_url: string;
  status: TransparencyImportJobStatus;
  started_by: string | null;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TransparencyImportSource = {
  id: string;
  organization_id: string;
  legislature_id: string;
  job_id: string;
  url: string;
  title: string | null;
  source_type: TransparencyImportSourceType;
  category: TransparencyImportCategory;
  status: TransparencyImportSourceStatus;
  document_id: string | null;
  checksum: string | null;
  discovered_at: string;
  created_at: string;
  updated_at: string;
};

export type TransparencyImportStaging = {
  id: string;
  organization_id: string;
  legislature_id: string;
  job_id: string;
  source_id: string | null;
  entity_type: TransparencyImportEntityType;
  extracted_data: Record<string, unknown>;
  matched_existing_table: string | null;
  matched_existing_id: string | null;
  confidence: number | null;
  status: TransparencyImportStagingStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TransparencyImportDiff = {
  id: string;
  organization_id: string;
  legislature_id: string;
  job_id: string;
  staging_id: string | null;
  target_table: string;
  target_id: string | null;
  change_type: TransparencyImportChangeType;
  current_data: Record<string, unknown>;
  proposed_data: Record<string, unknown>;
  diff_summary: string | null;
  risk_level: OperationalPriority;
  status: TransparencyImportDiffStatus;
  created_at: string;
  updated_at: string;
};
