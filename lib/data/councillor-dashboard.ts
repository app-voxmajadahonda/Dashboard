import type { LucideIcon } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { OrganizationContext } from "@/lib/auth/organization";
import type { DataSource, DataStatus } from "@/components/dashboard/dashboard-components";
import type { DocumentKind } from "@/lib/types";
import {
  ageStructure,
  budgetEvolution,
  budgetKpis,
  comparisonRows,
  crimeEvolution,
  demographicEvolution,
  fiscalOrdinances,
  generalKpis,
  institutionalEvents,
  motions,
  politicalProfile,
  questions,
  securityIssues,
  securityKpis,
  serviceRows,
  sidebarSections,
  sources,
  votePatterns
} from "@/lib/mock/councillor-dashboard";

type KpiItem = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  source: DataSource;
  tone?: "neutral" | "strong" | "critical";
};

type MunicipalIndicatorRow = {
  category: string;
  indicator_key: string;
  label: string;
  value: unknown;
  unit: string | null;
  period: string | null;
  source_name: string | null;
  source_url: string | null;
  source_key: string | null;
  data_status: DataStatus;
  confidence: DataSource["confidence"];
  updated_at: string | null;
  expires_at: string | null;
};

type DocumentRow = {
  kind: DocumentKind;
  title: string;
  processing_status: string;
  source_name: string | null;
  updated_at: string | null;
};

const kpiOverrides: Record<string, { group: "general" | "security" | "budget"; index: number }> = {
  total_population: { group: "general", index: 0 },
  average_household_income: { group: "general", index: 1 },
  budget_per_capita: { group: "general", index: 2 },
  local_police_staff: { group: "security", index: 0 },
  police_ratio_per_1000: { group: "security", index: 1 },
  quarterly_crime: { group: "security", index: 2 },
  total_budget: { group: "budget", index: 0 },
  current_spending_per_capita: { group: "budget", index: 1 },
  debt_per_capita: { group: "budget", index: 2 },
  fiscal_ordinances_loaded: { group: "budget", index: 3 }
};

const documentKindLabels: Partial<Record<DocumentKind, string>> = {
  fiscal_ordinance: "Fiscalidad",
  budget: "Presupuesto",
  delegation_decree: "Organización municipal",
  rom: "Régimen municipal",
  electoral_program: "Programa electoral",
  strategic_plan: "Plan estratégico",
  communication_plan: "Comunicación",
  minutes: "Acta",
  agenda: "Orden del día",
  contract: "Contratación",
  report: "Informe"
};

function cloneKpis(items: KpiItem[]) {
  return items.map((item) => ({ ...item, source: { ...item.source } }));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function displayValue(row: MunicipalIndicatorRow) {
  const value = asRecord(row.value);
  const display = value.display ?? value.value ?? value.amount ?? value.total;

  if (typeof display === "string") {
    return display;
  }

  if (typeof display === "number") {
    return row.unit ? `${display.toLocaleString("es-ES")} ${row.unit}` : display.toLocaleString("es-ES");
  }

  return "Pendiente";
}

function detailValue(row: MunicipalIndicatorRow) {
  const detail = asRecord(row.value).detail;
  return typeof detail === "string" ? detail : row.period ? `Periodo ${row.period}` : "Dato cargado en base de datos.";
}

function sourceFromIndicator(row: MunicipalIndicatorRow): DataSource {
  const isExpired = row.expires_at ? new Date(row.expires_at).getTime() < Date.now() : false;

  return {
    label: row.source_name ?? "Dato municipal cargado",
    updatedAt: isExpired
      ? `Caducado el ${new Date(row.expires_at as string).toLocaleDateString("es-ES")}`
      : row.updated_at
        ? new Date(row.updated_at).toLocaleDateString("es-ES")
        : "Pendiente",
    confidence: row.confidence,
    status: isExpired ? "desactualizado" : row.data_status,
    href: row.source_url ?? undefined
  };
}

function applyIndicatorOverrides(kpis: {
  general: KpiItem[];
  security: KpiItem[];
  budget: KpiItem[];
}, indicators: MunicipalIndicatorRow[]) {
  indicators.forEach((indicator) => {
    const override = kpiOverrides[indicator.indicator_key];

    if (!override) {
      return;
    }

    kpis[override.group][override.index] = {
      ...kpis[override.group][override.index],
      label: indicator.label || kpis[override.group][override.index].label,
      value: displayValue(indicator),
      detail: detailValue(indicator),
      source: sourceFromIndicator(indicator),
      tone: sourceFromIndicator(indicator).status === "desactualizado" ? "critical" : kpis[override.group][override.index].tone
    };
  });
}

function documentCardsFromRows(rows: DocumentRow[]) {
  const fallback = [
    {
      source: sources.internal,
      status: "Pendiente de carga por portavoz/admin",
      title: "Informe trimestral de criminalidad",
      type: "Seguridad"
    },
    {
      source: sources.internal,
      status: "Pendiente de extracción y validación",
      title: "Ordenanzas fiscales",
      type: "Fiscalidad"
    },
    {
      source: sources.internal,
      status: "Pendiente de carga estructurada",
      title: "Presupuesto municipal",
      type: "Presupuesto"
    },
    {
      source: sources.internal,
      status: "Pendiente de extracción de medidas",
      title: "Programa electoral",
      type: "Programa electoral"
    }
  ];

  if (!rows.length) {
    return fallback;
  }

  return rows.slice(0, 6).map((row) => ({
    title: row.title,
    type: documentKindLabels[row.kind] ?? "Documento",
    status: `Estado: ${row.processing_status}`,
    source: {
      label: row.source_name ?? "Carga documental",
      updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString("es-ES") : "Pendiente",
      confidence: "media",
      status: row.processing_status === "validated" ? "oficial" : "pendiente_validacion"
    } satisfies DataSource
  }));
}

export async function getCouncillorDashboardData(context: OrganizationContext | null) {
  const kpis = {
    general: cloneKpis(generalKpis),
    security: cloneKpis(securityKpis),
    budget: cloneKpis(budgetKpis)
  };

  if (!context) {
    return {
      sourceMode: "fallback" as const,
      generalKpis: kpis.general,
      securityKpis: kpis.security,
      budgetKpis: kpis.budget,
      documentCards: documentCardsFromRows([]),
      ageStructure,
      budgetEvolution,
      comparisonRows,
      crimeEvolution,
      demographicEvolution,
      fiscalOrdinances,
      institutionalEvents,
      motions,
      politicalProfile,
      questions,
      securityIssues,
      serviceRows,
      sidebarSections,
      sources,
      votePatterns
    };
  }

  try {
    const adminClient = getSupabaseAdminClient();
    const [{ data: indicatorRows }, { data: documentRows }] = await Promise.all([
      adminClient
        .from("municipal_indicators")
        .select("category, indicator_key, label, value, unit, period, source_name, source_url, source_key, data_status, confidence, updated_at, expires_at")
        .eq("organization_id", context.organization.id),
      adminClient
        .from("documents")
        .select("kind, title, processing_status, source_name, updated_at")
        .eq("organization_id", context.organization.id)
        .order("updated_at", { ascending: false })
        .limit(6)
    ]);

    applyIndicatorOverrides(kpis, (indicatorRows ?? []) as MunicipalIndicatorRow[]);

    return {
      sourceMode: (indicatorRows?.length ? "database" : "fallback") as "database" | "fallback",
      generalKpis: kpis.general,
      securityKpis: kpis.security,
      budgetKpis: kpis.budget,
      documentCards: documentCardsFromRows((documentRows ?? []) as DocumentRow[]),
      ageStructure,
      budgetEvolution,
      comparisonRows,
      crimeEvolution,
      demographicEvolution,
      fiscalOrdinances,
      institutionalEvents,
      motions,
      politicalProfile,
      questions,
      securityIssues,
      serviceRows,
      sidebarSections,
      sources,
      votePatterns
    };
  } catch {
    return {
      sourceMode: "fallback" as const,
      generalKpis: kpis.general,
      securityKpis: kpis.security,
      budgetKpis: kpis.budget,
      documentCards: documentCardsFromRows([]),
      ageStructure,
      budgetEvolution,
      comparisonRows,
      crimeEvolution,
      demographicEvolution,
      fiscalOrdinances,
      institutionalEvents,
      motions,
      politicalProfile,
      questions,
      securityIssues,
      serviceRows,
      sidebarSections,
      sources,
      votePatterns
    };
  }
}
