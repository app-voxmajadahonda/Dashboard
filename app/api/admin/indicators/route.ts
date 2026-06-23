import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { optionalUrl, textValue } from "@/lib/server/form";
import type { DataStatus } from "@/lib/types";

const validStatuses = new Set<DataStatus>([
  "oficial",
  "pendiente_validacion",
  "estimado",
  "interno",
  "desactualizado"
]);

function expiresAtFromDays(days: number | null) {
  if (!days || days <= 0) {
    return null;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const catalogItemId = textValue(formData, "catalogItemId");
  const displayValue = textValue(formData, "displayValue");
  const rawValue = textValue(formData, "rawValue");
  const detail = textValue(formData, "detail");
  const period = textValue(formData, "period") || "actual";
  const unit = textValue(formData, "unit");
  const sourceName = textValue(formData, "sourceName");
  const sourceUrl = optionalUrl(textValue(formData, "sourceUrl"));
  const status = textValue(formData, "dataStatus") as DataStatus;
  const confidence = textValue(formData, "confidence") || "media";

  if (!catalogItemId || !displayValue || !validStatuses.has(status)) {
    return NextResponse.json({ error: "Faltan datos obligatorios del indicador." }, { status: 400 });
  }

  const adminClient = getSupabaseAdminClient();
  const { data: catalogItem, error: catalogError } = await adminClient
    .from("data_catalog_items")
    .select(
      "id, data_key, display_name, dashboard_tab, preferred_source, source_url, refresh_interval_days, target_indicator_key"
    )
    .eq("organization_id", context.organization.id)
    .eq("id", catalogItemId)
    .single();

  if (catalogError || !catalogItem) {
    return NextResponse.json({ error: "No se ha encontrado el dato en el catálogo." }, { status: 404 });
  }

  const numericValue = rawValue ? Number(rawValue.replace(",", ".")) : null;
  const now = new Date().toISOString();
  const value = {
    display: displayValue,
    value: Number.isFinite(numericValue) ? numericValue : rawValue || displayValue,
    detail: detail || null
  };

  const { error } = await adminClient.from("municipal_indicators").upsert(
    {
      organization_id: context.organization.id,
      category: catalogItem.dashboard_tab,
      indicator_key: catalogItem.target_indicator_key,
      label: catalogItem.display_name,
      value,
      unit: unit || null,
      period,
      source_name: sourceName || catalogItem.preferred_source,
      source_url: sourceUrl || catalogItem.source_url || null,
      source_key: catalogItem.data_key,
      data_status: status,
      confidence,
      loaded_by: user.id,
      updated_at: now,
      expires_at: expiresAtFromDays(catalogItem.refresh_interval_days)
    },
    {
      onConflict: "organization_id,category,indicator_key,period"
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await adminClient.from("audit_log").insert({
    organization_id: context.organization.id,
    actor_user_id: user.id,
    action: "municipal_indicator_loaded",
    target_table: "municipal_indicators",
    metadata: {
      catalogItemId,
      indicatorKey: catalogItem.target_indicator_key,
      period,
      status
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Indicador cargado correctamente."
  });
}
