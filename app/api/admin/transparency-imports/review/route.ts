import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type SupportedEntityType =
  | "municipal_corporation_member"
  | "municipal_group"
  | "government_area"
  | "delegated_councillor"
  | "standing_committee"
  | "plenary_regular_schedule"
  | "committee_regular_schedule";

const entityTableMap: Record<SupportedEntityType, string> = {
  municipal_corporation_member: "municipal_corporation_members",
  municipal_group: "municipal_groups",
  government_area: "government_areas",
  delegated_councillor: "delegated_councillors",
  standing_committee: "standing_committees",
  plenary_regular_schedule: "plenary_regular_schedule",
  committee_regular_schedule: "committee_regular_schedule"
};

function isSupportedEntityType(value: string): value is SupportedEntityType {
  return value in entityTableMap;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function boolValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "si", "sí"].includes(value.trim().toLowerCase());
  return false;
}

function arrayValue(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function dateValue(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function cleanPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function proposedPayloadFor(entityType: SupportedEntityType, extractedData: Record<string, unknown>) {
  const title = firstString(extractedData.title, extractedData.name, extractedData.nombre);
  const sourceUrl = firstString(extractedData.url, extractedData.source_url);

  if (entityType === "municipal_corporation_member") {
    const fullName = firstString(extractedData.full_name, extractedData.nombre, extractedData.name, title);
    if (!fullName) return null;
    return cleanPayload({
      full_name: fullName,
      political_group: firstString(extractedData.political_group, extractedData.grupo, extractedData.grupo_municipal),
      party: firstString(extractedData.party, extractedData.partido),
      role: firstString(extractedData.role, extractedData.cargo),
      is_mayor: boolValue(extractedData.is_mayor ?? extractedData.alcalde),
      is_government_member: boolValue(extractedData.is_government_member ?? extractedData.gobierno),
      order_number: numberValue(extractedData.order_number ?? extractedData.orden),
      start_date: dateValue(extractedData.start_date ?? extractedData.inicio),
      end_date: dateValue(extractedData.end_date ?? extractedData.fin),
      active: true
    });
  }

  if (entityType === "municipal_group") {
    const name = firstString(extractedData.name, extractedData.nombre, extractedData.group_name, title);
    if (!name) return null;
    return cleanPayload({
      name,
      party: firstString(extractedData.party, extractedData.partido),
      spokesperson_name: firstString(extractedData.spokesperson_name, extractedData.portavoz),
      deputy_spokesperson_name: firstString(extractedData.deputy_spokesperson_name, extractedData.portavoz_adjunto),
      councillors_count: numberValue(extractedData.councillors_count ?? extractedData.concejales),
      votes: numberValue(extractedData.votes ?? extractedData.votos),
      vote_percentage: numberValue(extractedData.vote_percentage ?? extractedData.porcentaje_voto),
      seats: numberValue(extractedData.seats ?? extractedData.escanos),
      notes: sourceUrl ? `Fuente: ${sourceUrl}` : firstString(extractedData.notes, extractedData.observaciones)
    });
  }

  if (entityType === "government_area") {
    const name = firstString(extractedData.name, extractedData.nombre, title);
    if (!name) return null;
    return cleanPayload({
      name,
      description: firstString(extractedData.description, extractedData.descripcion),
      competencies: arrayValue(extractedData.competencies ?? extractedData.competencias),
      active: true
    });
  }

  if (entityType === "delegated_councillor") {
    const delegationTitle = firstString(extractedData.delegation_title, extractedData.titulo, extractedData.nombre, title);
    if (!delegationTitle) return null;
    return cleanPayload({
      delegation_title: delegationTitle,
      competencies: arrayValue(extractedData.competencies ?? extractedData.competencias),
      decree_reference: firstString(extractedData.decree_reference, extractedData.decreto),
      start_date: dateValue(extractedData.start_date ?? extractedData.inicio),
      end_date: dateValue(extractedData.end_date ?? extractedData.fin),
      active: true
    });
  }

  if (entityType === "standing_committee") {
    const name = firstString(extractedData.name, extractedData.nombre, title);
    if (!name) return null;
    return cleanPayload({
      name,
      description: firstString(extractedData.description, extractedData.descripcion),
      committee_type: firstString(extractedData.committee_type, extractedData.tipo) ?? "standing",
      ordinary_schedule_rule: firstString(extractedData.ordinary_schedule_rule, extractedData.regimen_ordinario),
      active: true
    });
  }

  const ruleDescription = firstString(extractedData.rule_description, extractedData.regla, extractedData.descripcion, title);
  if (!ruleDescription) return null;

  return cleanPayload({
    rule_description: ruleDescription,
    frequency: firstString(extractedData.frequency, extractedData.frecuencia),
    weekday: firstString(extractedData.weekday, extractedData.dia_semana),
    week_of_month: numberValue(extractedData.week_of_month ?? extractedData.semana_mes),
    time: firstString(extractedData.time, extractedData.hora),
    exceptions: arrayValue(extractedData.exceptions ?? extractedData.excepciones),
    active: true
  });
}

function identityFieldFor(entityType: SupportedEntityType) {
  if (entityType === "municipal_corporation_member") return "full_name";
  if (entityType === "delegated_councillor") return "delegation_title";
  if (entityType === "plenary_regular_schedule" || entityType === "committee_regular_schedule") return "rule_description";
  return "name";
}

async function audit(organizationId: string, userId: string, action: string, targetTable: string, targetId: string, metadata = {}) {
  await getSupabaseAdminClient().from("audit_log").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata
  });
}

async function applyStagingItem({
  organizationId,
  staging,
  userId
}: {
  organizationId: string;
  staging: {
    id: string;
    legislature_id: string;
    job_id: string;
    entity_type: string;
    extracted_data: Record<string, unknown>;
    matched_existing_table: string | null;
    matched_existing_id: string | null;
    review_notes: string | null;
  };
  userId: string;
}) {
  if (!isSupportedEntityType(staging.entity_type)) {
    return { applied: false, reason: `Entidad no aplicable automaticamente: ${staging.entity_type}` };
  }

  const adminClient = getSupabaseAdminClient();
  const table = entityTableMap[staging.entity_type];
  const proposed = proposedPayloadFor(staging.entity_type, staging.extracted_data);

  if (!proposed) {
    return { applied: false, reason: "El dato detectado no contiene campos suficientes para aplicarse." };
  }

  const identityField = identityFieldFor(staging.entity_type);
  const identityValue = proposed[identityField];
  let targetId = staging.matched_existing_id;
  let currentData: Record<string, unknown> = {};

  if (!targetId && typeof identityValue === "string" && identityValue.trim()) {
    const { data: existing } = await adminClient
      .from(table)
      .select("*")
      .eq("organization_id", organizationId)
      .eq("legislature_id", staging.legislature_id)
      .ilike(identityField, identityValue)
      .maybeSingle();

    if (existing?.id) {
      targetId = existing.id as string;
      currentData = asRecord(existing);
    }
  }

  const now = new Date().toISOString();
  let changeType: "create" | "update" = "create";

  if (targetId) {
    if (!Object.keys(currentData).length) {
      const { data: existing } = await adminClient
        .from(table)
        .select("*")
        .eq("organization_id", organizationId)
        .eq("legislature_id", staging.legislature_id)
        .eq("id", targetId)
        .maybeSingle();
      currentData = asRecord(existing);
    }

    const { error } = await adminClient
      .from(table)
      .update({ ...proposed, updated_at: now })
      .eq("organization_id", organizationId)
      .eq("legislature_id", staging.legislature_id)
      .eq("id", targetId);

    if (error) throw new Error(error.message);
    changeType = "update";
  } else {
    const { data, error } = await adminClient
      .from(table)
      .insert({
        ...proposed,
        organization_id: organizationId,
        legislature_id: staging.legislature_id,
        updated_at: now
      })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "No se ha podido aplicar el dato.");
    targetId = data.id as string;
  }

  const sourceUrl = firstString(staging.extracted_data.url, staging.extracted_data.source_url);
  await adminClient.from("legislature_change_log").insert({
    organization_id: organizationId,
    legislature_id: staging.legislature_id,
    import_job_id: staging.job_id,
    staging_id: staging.id,
    entity_type: staging.entity_type,
    target_table: table,
    target_id: targetId,
    change_type: changeType,
    old_data: currentData,
    new_data: proposed,
    source_url: sourceUrl,
    applied_by: userId,
    notes: staging.review_notes
  });

  await adminClient
    .from("transparency_import_staging")
    .update({
      status: "applied",
      applied_at: now,
      matched_existing_table: table,
      matched_existing_id: targetId,
      updated_at: now
    })
    .eq("id", staging.id)
    .eq("organization_id", organizationId);

  await adminClient
    .from("transparency_import_diffs")
    .update({
      status: "applied",
      target_table: table,
      target_id: targetId,
      change_type: changeType,
      current_data: currentData,
      proposed_data: proposed,
      updated_at: now
    })
    .eq("staging_id", staging.id)
    .eq("organization_id", organizationId);

  await audit(organizationId, userId, "transparency_import_change_applied", table, targetId, {
    jobId: staging.job_id,
    stagingId: staging.id,
    entityType: staging.entity_type,
    changeType
  });

  return { applied: true, reason: changeType };
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const action = textValue(formData, "action");
  const jobId = textValue(formData, "jobId");
  const stagingId = textValue(formData, "stagingId");
  const adminClient = getSupabaseAdminClient();

  try {
    if (!jobId) {
      return NextResponse.json({ error: "Falta el job de importacion." }, { status: 400 });
    }

    if (action === "approve-staging" || action === "reject-staging") {
      if (!stagingId) {
        return NextResponse.json({ error: "Falta el dato a revisar." }, { status: 400 });
      }

      const status = action === "approve-staging" ? "approved" : "rejected";
      const { error } = await adminClient
        .from("transparency_import_staging")
        .update({
          status,
          review_notes: textValue(formData, "reviewNotes") || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", stagingId)
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId);

      if (error) throw new Error(error.message);

      await adminClient
        .from("transparency_import_diffs")
        .update({ status: status === "approved" ? "approved" : "rejected", updated_at: new Date().toISOString() })
        .eq("staging_id", stagingId)
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId);

      await audit(context.organization.id, user.id, `transparency_import_${status}`, "transparency_import_staging", stagingId, {
        jobId
      });
      return NextResponse.json({ ok: true, message: status === "approved" ? "Dato aprobado." : "Dato rechazado." });
    }

    if (action === "cancel-job") {
      const { error } = await adminClient
        .from("transparency_import_jobs")
        .update({ status: "cancelled", finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("organization_id", context.organization.id);

      if (error) throw new Error(error.message);

      await adminClient
        .from("system_locks")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("organization_id", context.organization.id)
        .eq("reason", "transparency_portal_import")
        .eq("status", "active");

      await audit(context.organization.id, user.id, "transparency_import_cancelled", "transparency_import_jobs", jobId, {});
      return NextResponse.json({ ok: true, message: "Importacion cancelada." });
    }

    if (action === "apply-staging") {
      if (!stagingId) {
        return NextResponse.json({ error: "Falta el dato a aplicar." }, { status: 400 });
      }

      const { data: staging } = await adminClient
        .from("transparency_import_staging")
        .select("*")
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId)
        .eq("id", stagingId)
        .single();

      if (!staging) {
        return NextResponse.json({ error: "No se ha encontrado el dato aprobado." }, { status: 404 });
      }

      const result = await applyStagingItem({
        organizationId: context.organization.id,
        staging: {
          id: staging.id as string,
          legislature_id: staging.legislature_id as string,
          job_id: staging.job_id as string,
          entity_type: staging.entity_type as string,
          extracted_data: asRecord(staging.extracted_data),
          matched_existing_table: (staging.matched_existing_table as string | null) ?? null,
          matched_existing_id: (staging.matched_existing_id as string | null) ?? null,
          review_notes: (staging.review_notes as string | null) ?? null
        },
        userId: user.id
      });

      if (!result.applied) {
        return NextResponse.json({ error: result.reason }, { status: 409 });
      }

      return NextResponse.json({ ok: true, message: "Cambio aplicado con trazabilidad de fecha." });
    }

    if (action === "apply-approved") {
      const { data: approvedItems } = await adminClient
        .from("transparency_import_staging")
        .select("*")
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId)
        .eq("status", "approved");

      const results = [];
      for (const item of approvedItems ?? []) {
        results.push(
          await applyStagingItem({
            organizationId: context.organization.id,
            staging: {
              id: item.id as string,
              legislature_id: item.legislature_id as string,
              job_id: item.job_id as string,
              entity_type: item.entity_type as string,
              extracted_data: asRecord(item.extracted_data),
              matched_existing_table: (item.matched_existing_table as string | null) ?? null,
              matched_existing_id: (item.matched_existing_id as string | null) ?? null,
              review_notes: (item.review_notes as string | null) ?? null
            },
            userId: user.id
          })
        );
      }

      const appliedCount = results.filter((result) => result.applied).length;
      const skippedCount = results.length - appliedCount;
      await adminClient
        .from("transparency_import_jobs")
        .update({
          status: skippedCount ? "needs_review" : "applied",
          updated_at: new Date().toISOString(),
          finished_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .eq("organization_id", context.organization.id);

      return NextResponse.json({
        ok: true,
        message: `Cambios aplicados: ${appliedCount}. Pendientes/no aplicables: ${skippedCount}.`
      });
    }

    return NextResponse.json({ error: "Accion no reconocida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido revisar la importacion." },
      { status: 400 }
    );
  }
}
