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
