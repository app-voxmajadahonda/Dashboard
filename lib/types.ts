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
  | "register_motion"
  | "register_institutional_request"
  | "import_minutes"
  | "import_budget"
  | "import_fiscal_ordinance"
  | "import_crime_report"
  | "import_contract";

export type GuidedProcessStatus = "started" | "pending_review" | "completed" | "failed" | "cancelled";

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
