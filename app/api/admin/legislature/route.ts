import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { safeFilename, textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { DocumentKind, LegislatureDocumentRole } from "@/lib/types";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain"
]);

const roleToKind: Record<LegislatureDocumentRole, DocumentKind> = {
  organization_plenary: "minutes",
  delegation_decree: "delegation_decree",
  committee_creation: "agreement",
  municipal_rom: "rom",
  municipal_group_composition: "report",
  logo: "other",
  other: "other"
};

function parseJsonObject(value: string) {
  if (!value) {
    return {};
  }

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("El JSON de revision debe ser un objeto.");
  }
  return parsed as Record<string, unknown>;
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

async function createDocumentFromUpload({
  file,
  kind,
  organizationId,
  userId,
  title,
  governingBody
}: {
  file: File;
  kind: DocumentKind;
  organizationId: string;
  userId: string;
  title: string;
  governingBody: string;
}) {
  const adminClient = getSupabaseAdminClient();
  const { data: documentRow, error: documentError } = await adminClient
    .from("documents")
    .insert({
      organization_id: organizationId,
      kind,
      title,
      source_name: "Configuracion de legislatura",
      governing_body: governingBody,
      processing_status: "uploaded",
      created_by: userId
    })
    .select("id")
    .single();

  if (documentError || !documentRow) {
    throw new Error(documentError?.message ?? "No se ha podido registrar el documento.");
  }

  const filename = safeFilename(file.name || `${kind}.pdf`);
  const storagePath = `${organizationId}/legislature/${documentRow.id}/${filename}`;
  const { error: uploadError } = await adminClient.storage.from("documents").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (uploadError) {
    await adminClient.from("documents").update({ processing_status: "failed" }).eq("id", documentRow.id);
    throw new Error(uploadError.message);
  }

  const { error: fileError } = await adminClient.from("document_files").insert({
    document_id: documentRow.id,
    storage_bucket: "documents",
    storage_path: storagePath,
    mime_type: file.type || null,
    size_bytes: file.size,
    original_filename: file.name
  });

  if (fileError) {
    throw new Error(fileError.message);
  }

  await adminClient.from("document_extractions").insert({
    document_id: documentRow.id,
    summary: "Documento de legislatura cargado. Pendiente de extraccion estructurada y revision humana.",
    structured_data: {
      extractionStatus: "pending_text_extraction",
      legislatureConfiguration: true,
      humanReviewRequired: true
    },
    model: "pending"
  });

  return documentRow.id as string;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value.map(asRecord).filter((item) => Object.keys(item).length > 0) : [];
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "si", "sí", "1"].includes(value.trim().toLowerCase());
  }

  return false;
}

function asJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

async function persistReviewedLegislatureData(organizationId: string, legislatureDocumentId: string) {
  const adminClient = getSupabaseAdminClient();
  const { data: document, error } = await adminClient
    .from("legislature_documents")
    .select("legislature_id, document_id, reviewed_data")
    .eq("organization_id", organizationId)
    .eq("id", legislatureDocumentId)
    .single();

  if (error || !document) {
    throw new Error(error?.message ?? "No se ha encontrado el documento de legislatura.");
  }

  const reviewedData = asRecord(document.reviewed_data);
  const sourceDocumentId = document.document_id as string;
  const legislatureId = document.legislature_id as string;
  const counts: Record<string, number> = {};

  const councillors = asArray(
    reviewedData.concejales ?? reviewedData.municipal_corporation_members ?? reviewedData.corporation_members
  );
  if (councillors.length) {
    await adminClient
      .from("municipal_corporation_members")
      .delete()
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("source_document_id", sourceDocumentId);

    const rows = councillors
      .map((item, index) => ({
        organization_id: organizationId,
        legislature_id: legislatureId,
        full_name: asString(item.full_name ?? item.nombre ?? item.name),
        political_group: asString(item.political_group ?? item.grupo ?? item.grupo_municipal),
        party: asString(item.party ?? item.partido),
        role: asString(item.role ?? item.cargo),
        is_mayor: asBoolean(item.is_mayor ?? item.alcalde),
        is_government_member: asBoolean(item.is_government_member ?? item.gobierno),
        order_number: asNumber(item.order_number ?? item.orden) ?? index + 1,
        source_document_id: sourceDocumentId
      }))
      .filter((row) => row.full_name);

    if (rows.length) {
      const { error: insertError } = await adminClient.from("municipal_corporation_members").insert(rows);
      if (insertError) {
        throw new Error(insertError.message);
      }
      counts.concejales = rows.length;
    }
  }

  const municipalGroups = asArray(reviewedData.grupos_municipales ?? reviewedData.municipal_groups);
  if (municipalGroups.length) {
    const rows = municipalGroups
      .map((item) => ({
        organization_id: organizationId,
        legislature_id: legislatureId,
        name: asString(item.name ?? item.nombre),
        party: asString(item.party ?? item.partido),
        spokesperson_name: asString(item.spokesperson_name ?? item.portavoz),
        deputy_spokesperson_name: asString(item.deputy_spokesperson_name ?? item.portavoz_adjunto),
        councillors_count: asNumber(item.councillors_count ?? item.concejales),
        votes: asNumber(item.votes ?? item.votos),
        vote_percentage: asNumber(item.vote_percentage ?? item.porcentaje_voto),
        seats: asNumber(item.seats ?? item.escanos ?? item.concejales),
        notes: asString(item.notes ?? item.observaciones),
        updated_at: new Date().toISOString()
      }))
      .filter((row) => row.name);

    if (rows.length) {
      const { error: upsertError } = await adminClient.from("municipal_groups").upsert(rows, {
        onConflict: "legislature_id,name"
      });
      if (upsertError) {
        throw new Error(upsertError.message);
      }
      counts.grupos_municipales = rows.length;
    }
  }

  const areas = asArray(reviewedData.areas_gobierno ?? reviewedData.government_areas);
  if (areas.length) {
    const rows = areas
      .map((item) => ({
        organization_id: organizationId,
        legislature_id: legislatureId,
        name: asString(item.name ?? item.nombre),
        description: asString(item.description ?? item.descripcion),
        competencies: asJsonArray(item.competencies ?? item.competencias),
        source_document_id: sourceDocumentId,
        active: true,
        updated_at: new Date().toISOString()
      }))
      .filter((row) => row.name);

    if (rows.length) {
      const { error: upsertError } = await adminClient.from("government_areas").upsert(rows, {
        onConflict: "legislature_id,name"
      });
      if (upsertError) {
        throw new Error(upsertError.message);
      }
      counts.areas_gobierno = rows.length;
    }
  }

  const committees = asArray(reviewedData.comisiones ?? reviewedData.standing_committees);
  if (committees.length) {
    const rows = committees
      .map((item) => ({
        organization_id: organizationId,
        legislature_id: legislatureId,
        name: asString(item.name ?? item.nombre),
        description: asString(item.description ?? item.descripcion),
        committee_type: asString(item.committee_type ?? item.tipo) ?? "standing",
        ordinary_schedule_rule: asString(item.ordinary_schedule_rule ?? item.regimen_ordinario),
        source_document_id: sourceDocumentId,
        active: true,
        updated_at: new Date().toISOString()
      }))
      .filter((row) => row.name);

    if (rows.length) {
      const { error: upsertError } = await adminClient.from("standing_committees").upsert(rows, {
        onConflict: "legislature_id,name"
      });
      if (upsertError) {
        throw new Error(upsertError.message);
      }
      counts.comisiones = rows.length;
    }
  }

  const plenarySchedules = asArray(reviewedData.calendario_plenos ?? reviewedData.plenary_regular_schedule);
  if (plenarySchedules.length) {
    await adminClient
      .from("plenary_regular_schedule")
      .delete()
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("source_document_id", sourceDocumentId);

    const rows = plenarySchedules
      .map((item) => ({
        organization_id: organizationId,
        legislature_id: legislatureId,
        rule_description: asString(item.rule_description ?? item.descripcion ?? item.regla),
        frequency: asString(item.frequency ?? item.frecuencia),
        weekday: asString(item.weekday ?? item.dia_semana),
        week_of_month: asNumber(item.week_of_month ?? item.semana_mes),
        time: asString(item.time ?? item.hora),
        exceptions: asJsonArray(item.exceptions ?? item.excepciones),
        source_document_id: sourceDocumentId,
        active: true
      }))
      .filter((row) => row.rule_description);

    if (rows.length) {
      const { error: insertError } = await adminClient.from("plenary_regular_schedule").insert(rows);
      if (insertError) {
        throw new Error(insertError.message);
      }
      counts.calendario_plenos = rows.length;
    }
  }

  return { counts, legislatureId };
}

async function generateBaseCalendar(organizationId: string, userId: string, legislatureId: string) {
  const adminClient = getSupabaseAdminClient();
  const { data: legislature } = await adminClient
    .from("legislatures")
    .select("name, start_date, end_date")
    .eq("organization_id", organizationId)
    .eq("id", legislatureId)
    .single();

  if (!legislature) {
    throw new Error("No se ha encontrado la legislatura.");
  }

  const { data: schedules } = await adminClient
    .from("plenary_regular_schedule")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("legislature_id", legislatureId)
    .eq("active", true);

  const currentYear = new Date().getFullYear();
  const rows = (schedules ?? []).slice(0, 1).flatMap((schedule) => {
    const time = typeof schedule.time === "string" ? schedule.time : "10:00";
    return Array.from({ length: 12 }, (_, month) => {
      const startsAt = new Date(currentYear, month, 15, Number(time.slice(0, 2)), Number(time.slice(3, 5) || "0"));
      return {
        organization_id: organizationId,
        title: `Pleno ordinario previsto ${month + 1}/${currentYear}`,
        description: `Evento generado desde configuracion de legislatura: ${schedule.rule_description}`,
        event_type: "pleno",
        starts_at: startsAt.toISOString(),
        status: "scheduled",
        related_entity_type: "legislatures",
        related_entity_id: legislatureId,
        created_by: userId
      };
    });
  });

  if (!rows.length) {
    return 0;
  }

  const { error } = await adminClient.from("calendar_events").insert(rows);
  if (error) {
    throw new Error(error.message);
  }

  await audit(organizationId, userId, "legislature_base_calendar_generated", "legislatures", legislatureId, {
    eventsCreated: rows.length
  });

  return rows.length;
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const action = textValue(formData, "action");
  const adminClient = getSupabaseAdminClient();

  try {
    if (action === "create-legislature") {
      const name = textValue(formData, "name");
      const startDate = textValue(formData, "startDate");
      const endDate = textValue(formData, "endDate");

      if (!name || !startDate || !endDate) {
        return NextResponse.json({ error: "Faltan datos de legislatura." }, { status: 400 });
      }

      const { data, error } = await adminClient
        .from("legislatures")
        .insert({
          organization_id: context.organization.id,
          name,
          start_date: startDate,
          end_date: endDate,
          status: "draft",
          configuration_status: "pending",
          created_by: user.id
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "No se ha podido crear la legislatura.");
      }

      await audit(context.organization.id, user.id, "legislature_created", "legislatures", data.id, { name });
      return NextResponse.json({ ok: true, message: "Legislatura creada.", legislatureId: data.id });
    }

    if (action === "upload-document") {
      const legislatureId = textValue(formData, "legislatureId");
      const documentRole = textValue(formData, "documentRole") as LegislatureDocumentRole;
      const title = textValue(formData, "title");
      const file = formData.get("file");

      if (!legislatureId || !documentRole || !title || !(file instanceof File)) {
        return NextResponse.json({ error: "Faltan datos del documento." }, { status: 400 });
      }

      if (file.type && !allowedMimeTypes.has(file.type)) {
        return NextResponse.json({ error: "Solo se admiten PDF, DOCX, DOC y TXT." }, { status: 400 });
      }

      const documentId = await createDocumentFromUpload({
        file,
        kind: roleToKind[documentRole] ?? "other",
        organizationId: context.organization.id,
        userId: user.id,
        title,
        governingBody: "Configuracion de legislatura"
      });

      const { data, error } = await adminClient
        .from("legislature_documents")
        .insert({
          organization_id: context.organization.id,
          legislature_id: legislatureId,
          document_id: documentId,
          document_role: documentRole,
          status: "needs_review",
          extracted_data: {
            pendingExtraction: true,
            expectedReview: [
              "concejales",
              "grupos_municipales",
              "areas_gobierno",
              "comisiones",
              "calendario_plenos",
              "calendario_comisiones"
            ]
          },
          confidence: null
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "No se ha podido vincular el documento a la legislatura.");
      }

      await adminClient
        .from("legislatures")
        .update({ configuration_status: "needs_review", updated_at: new Date().toISOString() })
        .eq("id", legislatureId)
        .eq("organization_id", context.organization.id);

      await audit(context.organization.id, user.id, "legislature_document_uploaded", "legislature_documents", data.id, {
        documentRole,
        documentId
      });

      return NextResponse.json({ ok: true, message: "Documento subido y pendiente de revision." });
    }

    if (action === "save-review") {
      const legislatureDocumentId = textValue(formData, "legislatureDocumentId");
      const reviewedData = parseJsonObject(textValue(formData, "reviewedData"));

      const { error } = await adminClient
        .from("legislature_documents")
        .update({
          reviewed_data: reviewedData,
          status: "needs_review",
          updated_at: new Date().toISOString()
        })
        .eq("id", legislatureDocumentId)
        .eq("organization_id", context.organization.id);

      if (error) {
        throw new Error(error.message);
      }

      await audit(context.organization.id, user.id, "legislature_document_review_saved", "legislature_documents", legislatureDocumentId, {});
      return NextResponse.json({ ok: true, message: "Revision guardada." });
    }

    if (action === "validate-document") {
      const legislatureDocumentId = textValue(formData, "legislatureDocumentId");
      const { counts } = await persistReviewedLegislatureData(context.organization.id, legislatureDocumentId);

      const { error } = await adminClient
        .from("legislature_documents")
        .update({ status: "validated", updated_at: new Date().toISOString() })
        .eq("id", legislatureDocumentId)
        .eq("organization_id", context.organization.id);

      if (error) {
        throw new Error(error.message);
      }

      await audit(context.organization.id, user.id, "legislature_document_validated", "legislature_documents", legislatureDocumentId, {
        persisted: counts
      });
      return NextResponse.json({ ok: true, message: "Documento validado y datos consolidados." });
    }

    if (action === "save-plenary-schedule") {
      const legislatureId = textValue(formData, "legislatureId");
      const ruleDescription = textValue(formData, "ruleDescription");
      const frequency = textValue(formData, "frequency");
      const weekday = textValue(formData, "weekday");
      const weekOfMonth = textValue(formData, "weekOfMonth");
      const time = textValue(formData, "time");

      if (!legislatureId || !ruleDescription) {
        return NextResponse.json({ error: "Falta la regla de calendario de Pleno." }, { status: 400 });
      }

      const { error } = await adminClient.from("plenary_regular_schedule").insert({
        organization_id: context.organization.id,
        legislature_id: legislatureId,
        rule_description: ruleDescription,
        frequency: frequency || null,
        weekday: weekday || null,
        week_of_month: weekOfMonth ? Number(weekOfMonth) : null,
        time: time || null,
        active: true
      });

      if (error) {
        throw new Error(error.message);
      }

      await audit(context.organization.id, user.id, "legislature_plenary_schedule_saved", "plenary_regular_schedule", legislatureId, {
        ruleDescription
      });
      return NextResponse.json({ ok: true, message: "Regla de Pleno ordinario guardada." });
    }

    if (action === "validate-legislature") {
      const legislatureId = textValue(formData, "legislatureId");

      const { error } = await adminClient
        .from("legislatures")
        .update({
          status: "active",
          configuration_status: "validated",
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", legislatureId)
        .eq("organization_id", context.organization.id);

      if (error) {
        throw new Error(error.message);
      }

      await audit(context.organization.id, user.id, "legislature_validated", "legislatures", legislatureId, {});
      return NextResponse.json({ ok: true, message: "Legislatura activada y validada." });
    }

    if (action === "generate-calendar") {
      const legislatureId = textValue(formData, "legislatureId");
      const count = await generateBaseCalendar(context.organization.id, user.id, legislatureId);
      return NextResponse.json({ ok: true, message: `Calendario base generado: ${count} eventos.` });
    }

    return NextResponse.json({ error: "Accion no reconocida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido completar la accion." },
      { status: 400 }
    );
  }
}
