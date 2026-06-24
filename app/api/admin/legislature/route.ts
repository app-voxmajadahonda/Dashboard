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

function jsonArrayFromText(value: string) {
  if (!value.trim()) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nullableDate(value: string) {
  return value || null;
}

function booleanFromForm(formData: FormData, name: string) {
  return formData.get(name) === "on" || textValue(formData, name) === "true";
}

async function upsertRecord({
  action,
  formData,
  organizationId,
  userId
}: {
  action: string;
  formData: FormData;
  organizationId: string;
  userId: string;
}) {
  const adminClient = getSupabaseAdminClient();
  const legislatureId = textValue(formData, "legislatureId");
  const recordId = textValue(formData, "recordId");

  if (!legislatureId) {
    throw new Error("Falta la legislatura activa.");
  }

  const base = {
    organization_id: organizationId,
    legislature_id: legislatureId,
    updated_at: new Date().toISOString()
  };

  const save = async (table: string, payload: Record<string, unknown>, auditAction: string) => {
    if (recordId) {
      const { error } = await adminClient
        .from(table)
        .update(payload)
        .eq("id", recordId)
        .eq("organization_id", organizationId)
        .eq("legislature_id", legislatureId);

      if (error) {
        throw new Error(error.message);
      }

      await audit(organizationId, userId, auditAction, table, recordId, { mode: "update" });
      return "Registro actualizado.";
    }

    const { data, error } = await adminClient
      .from(table)
      .insert({ ...payload, organization_id: organizationId, legislature_id: legislatureId })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se ha podido guardar el registro.");
    }

    await audit(organizationId, userId, auditAction, table, data.id as string, { mode: "insert" });
    return "Registro guardado.";
  };

  if (action === "save-corporation-member") {
    const fullName = textValue(formData, "fullName");
    if (!fullName) {
      throw new Error("Falta el nombre del concejal.");
    }

    return save(
      "municipal_corporation_members",
      {
        ...base,
        full_name: fullName,
        political_group: textValue(formData, "politicalGroup") || null,
        party: textValue(formData, "party") || null,
        role: textValue(formData, "role") || null,
        is_mayor: booleanFromForm(formData, "isMayor"),
        is_government_member: booleanFromForm(formData, "isGovernmentMember"),
        order_number: textValue(formData, "orderNumber") ? Number(textValue(formData, "orderNumber")) : null,
        start_date: nullableDate(textValue(formData, "startDate")),
        end_date: nullableDate(textValue(formData, "endDate")),
        active: booleanFromForm(formData, "active")
      },
      "legislature_corporation_member_saved"
    );
  }

  if (action === "save-municipal-group") {
    const name = textValue(formData, "name");
    if (!name) {
      throw new Error("Falta el nombre del grupo municipal.");
    }

    return save(
      "municipal_groups",
      {
        ...base,
        name,
        party: textValue(formData, "party") || null,
        spokesperson_name: textValue(formData, "spokespersonName") || null,
        deputy_spokesperson_name: textValue(formData, "deputySpokespersonName") || null,
        councillors_count: textValue(formData, "councillorsCount") ? Number(textValue(formData, "councillorsCount")) : null,
        votes: textValue(formData, "votes") ? Number(textValue(formData, "votes")) : null,
        vote_percentage: textValue(formData, "votePercentage") ? Number(textValue(formData, "votePercentage")) : null,
        seats: textValue(formData, "seats") ? Number(textValue(formData, "seats")) : null,
        notes: textValue(formData, "notes") || null
      },
      "legislature_municipal_group_saved"
    );
  }

  if (action === "save-government-area") {
    const name = textValue(formData, "name");
    if (!name) {
      throw new Error("Falta el nombre del area.");
    }

    return save(
      "government_areas",
      {
        ...base,
        name,
        description: textValue(formData, "description") || null,
        delegated_councillor_id: textValue(formData, "delegatedCouncillorId") || null,
        competencies: jsonArrayFromText(textValue(formData, "competencies")),
        active: booleanFromForm(formData, "active")
      },
      "legislature_government_area_saved"
    );
  }

  if (action === "save-delegation") {
    const delegationTitle = textValue(formData, "delegationTitle");
    if (!delegationTitle) {
      throw new Error("Falta el titulo de la delegacion.");
    }

    return save(
      "delegated_councillors",
      {
        ...base,
        councillor_id: textValue(formData, "councillorId") || null,
        area_id: textValue(formData, "areaId") || null,
        delegation_title: delegationTitle,
        competencies: jsonArrayFromText(textValue(formData, "competencies")),
        decree_reference: textValue(formData, "decreeReference") || null,
        start_date: nullableDate(textValue(formData, "startDate")),
        end_date: nullableDate(textValue(formData, "endDate")),
        active: booleanFromForm(formData, "active")
      },
      "legislature_delegation_saved"
    );
  }

  if (action === "save-standing-committee") {
    const name = textValue(formData, "name");
    if (!name) {
      throw new Error("Falta el nombre de la comision.");
    }

    return save(
      "standing_committees",
      {
        ...base,
        name,
        description: textValue(formData, "description") || null,
        committee_type: textValue(formData, "committeeType") || "standing",
        ordinary_schedule_rule: textValue(formData, "ordinaryScheduleRule") || null,
        active: booleanFromForm(formData, "active")
      },
      "legislature_standing_committee_saved"
    );
  }

  if (action === "save-committee-membership") {
    const committeeId = textValue(formData, "committeeId");
    if (!committeeId) {
      throw new Error("Falta la comision.");
    }

    return save(
      "committee_memberships",
      {
        ...base,
        committee_id: committeeId,
        councillor_id: textValue(formData, "councillorId") || null,
        political_group: textValue(formData, "politicalGroup") || null,
        role: textValue(formData, "membershipRole") || "member",
        is_primary: booleanFromForm(formData, "isPrimary"),
        substitute_for_id: textValue(formData, "substituteForId") || null,
        start_date: nullableDate(textValue(formData, "startDate")),
        end_date: nullableDate(textValue(formData, "endDate")),
        active: booleanFromForm(formData, "active")
      },
      "legislature_committee_membership_saved"
    );
  }

  if (action === "save-committee-schedule") {
    const committeeId = textValue(formData, "committeeId");
    const ruleDescription = textValue(formData, "ruleDescription");
    if (!committeeId || !ruleDescription) {
      throw new Error("Faltan la comision o la regla ordinaria.");
    }

    return save(
      "committee_regular_schedule",
      {
        ...base,
        committee_id: committeeId,
        rule_description: ruleDescription,
        frequency: textValue(formData, "frequency") || null,
        weekday: textValue(formData, "weekday") || null,
        week_of_month: textValue(formData, "weekOfMonth") ? Number(textValue(formData, "weekOfMonth")) : null,
        time: textValue(formData, "time") || null,
        exceptions: jsonArrayFromText(textValue(formData, "exceptions")),
        active: booleanFromForm(formData, "active")
      },
      "legislature_committee_schedule_saved"
    );
  }

  throw new Error("Accion estructurada no reconocida.");
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

const weekdayMap: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  "miércoles": 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  "sábado": 6
};

function getScheduledDate(year: number, month: number, weekOfMonth: number | null, weekday: string | null, time: string | null) {
  const hour = time ? Number(time.slice(0, 2)) : 10;
  const minute = time ? Number(time.slice(3, 5) || "0") : 0;
  const weekdayNumber = weekday ? weekdayMap[weekday.toLowerCase()] : undefined;

  if (weekdayNumber === undefined || !weekOfMonth) {
    return new Date(year, month, 15, hour, minute);
  }

  const firstDay = new Date(year, month, 1, hour, minute);
  const offset = (weekdayNumber - firstDay.getDay() + 7) % 7;
  const day = 1 + offset + (weekOfMonth - 1) * 7;
  return new Date(year, month, day, hour, minute);
}

function monthsBetween(start: Date, end: Date) {
  const months: Array<{ year: number; month: number }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const limit = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= limit) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

async function generateBaseCalendar(
  organizationId: string,
  userId: string,
  legislatureId: string,
  rangeMode = "current_year",
  rangeStart?: string,
  rangeEnd?: string
) {
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

  const currentYear = new Date().getFullYear();
  const startDate =
    rangeMode === "full_legislature"
      ? new Date(`${legislature.start_date}T00:00:00`)
      : rangeMode === "custom" && rangeStart
        ? new Date(`${rangeStart}T00:00:00`)
        : new Date(currentYear, 0, 1);
  const endDate =
    rangeMode === "full_legislature"
      ? new Date(`${legislature.end_date}T23:59:59`)
      : rangeMode === "custom" && rangeEnd
        ? new Date(`${rangeEnd}T23:59:59`)
        : new Date(currentYear, 11, 31, 23, 59, 59);

  const { data: plenarySchedules } = await adminClient
    .from("plenary_regular_schedule")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("legislature_id", legislatureId)
    .eq("active", true);

  const { data: committeeSchedules } = await adminClient
    .from("committee_regular_schedule")
    .select("*, standing_committees(name)")
    .eq("organization_id", organizationId)
    .eq("legislature_id", legislatureId)
    .eq("active", true);

  const months = monthsBetween(startDate, endDate);
  const rows = [
    ...(plenarySchedules ?? []).flatMap((schedule) =>
      months.map(({ year, month }) => {
        const startsAt = getScheduledDate(
          year,
          month,
          typeof schedule.week_of_month === "number" ? schedule.week_of_month : null,
          typeof schedule.weekday === "string" ? schedule.weekday : null,
          typeof schedule.time === "string" ? schedule.time : null
        );
        const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
        return {
          organization_id: organizationId,
          title: `Pleno ordinario previsto ${month + 1}/${year}`,
          description: `Evento generado desde configuracion de legislatura: ${schedule.rule_description}`,
          event_type: "pleno",
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "scheduled",
          related_entity_type: "legislatures",
          related_entity_id: legislatureId,
          created_by: userId
        };
      })
    ),
    ...(committeeSchedules ?? []).flatMap((schedule) =>
      months.map(({ year, month }) => {
        const startsAt = getScheduledDate(
          year,
          month,
          typeof schedule.week_of_month === "number" ? schedule.week_of_month : null,
          typeof schedule.weekday === "string" ? schedule.weekday : null,
          typeof schedule.time === "string" ? schedule.time : null
        );
        const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
        const committeeName =
          typeof schedule.standing_committees === "object" &&
          schedule.standing_committees &&
          "name" in schedule.standing_committees
            ? String(schedule.standing_committees.name)
            : "Comision";
        return {
          organization_id: organizationId,
          title: `${committeeName} ordinaria prevista ${month + 1}/${year}`,
          description: `Evento generado desde configuracion de legislatura: ${schedule.rule_description}`,
          event_type: "comision",
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "scheduled",
          related_entity_type: "standing_committees",
          related_entity_id: schedule.committee_id ?? legislatureId,
          created_by: userId
        };
      })
    )
  ].filter((row) => {
    const startsAt = new Date(row.starts_at);
    return startsAt >= startDate && startsAt <= endDate;
  });

  if (!rows.length) {
    return 0;
  }

  const { data: existingEvents } = await adminClient
    .from("calendar_events")
    .select("title, starts_at, event_type")
    .eq("organization_id", organizationId)
    .gte("starts_at", startDate.toISOString())
    .lte("starts_at", endDate.toISOString());

  const existingKeys = new Set((existingEvents ?? []).map((event) => `${event.event_type}|${event.title}|${event.starts_at}`));
  const newRows = rows.filter((row) => !existingKeys.has(`${row.event_type}|${row.title}|${row.starts_at}`));

  if (!newRows.length) {
    return 0;
  }

  const { error } = await adminClient.from("calendar_events").insert(newRows);
  if (error) {
    throw new Error(error.message);
  }

  await audit(organizationId, userId, "legislature_base_calendar_generated", "legislatures", legislatureId, {
    eventsCreated: newRows.length,
    rangeMode,
    rangeStart: startDate.toISOString(),
    rangeEnd: endDate.toISOString()
  });

  return newRows.length;
}

async function getActivationReadiness(organizationId: string, legislatureId: string) {
  const adminClient = getSupabaseAdminClient();
  const [
    { count: memberCount },
    { data: groups },
    { data: schedules },
    { data: documents },
    { data: committees },
    { data: areas }
  ] = await Promise.all([
    adminClient
      .from("municipal_corporation_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("active", true),
    adminClient.from("municipal_groups").select("name, spokesperson_name").eq("organization_id", organizationId).eq("legislature_id", legislatureId),
    adminClient
      .from("plenary_regular_schedule")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("active", true),
    adminClient
      .from("legislature_documents")
      .select("document_role, status")
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId),
    adminClient
      .from("standing_committees")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("active", true),
    adminClient
      .from("government_areas")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("legislature_id", legislatureId)
      .eq("active", true)
  ]);

  const hasVoxGroup = (groups ?? []).some((group) => String(group.name).toLowerCase().includes("vox"));
  const hasVoxSpokesperson = (groups ?? []).some(
    (group) => String(group.name).toLowerCase().includes("vox") && Boolean(group.spokesperson_name)
  );
  const hasRom = (documents ?? []).some((document) => document.document_role === "municipal_rom");

  const missingRequired = [
    !memberCount ? "composicion del Pleno" : null,
    !(groups ?? []).length ? "grupos municipales" : null,
    !hasVoxGroup ? "Grupo Municipal VOX identificado" : null,
    !hasVoxSpokesperson ? "portavoz VOX identificado" : null,
    !hasRom && !(schedules ?? []).length ? "ROM o regla de Pleno" : null,
    !(schedules ?? []).length ? "regla ordinaria de Pleno" : null
  ].filter(Boolean);

  const missingRecommended = [
    !(documents ?? []).some((document) => document.document_role === "delegation_decree") ? "decreto de delegaciones" : null,
    !(areas ?? []).length ? "areas de gobierno" : null,
    !(committees ?? []).length ? "comisiones informativas" : null,
    !(documents ?? []).some((document) => document.document_role === "logo") ? "logo del grupo municipal" : null
  ].filter(Boolean);

  return { missingRecommended, missingRequired };
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
    if (
      [
        "save-corporation-member",
        "save-municipal-group",
        "save-government-area",
        "save-delegation",
        "save-standing-committee",
        "save-committee-membership",
        "save-committee-schedule"
      ].includes(action)
    ) {
      const message = await upsertRecord({
        action,
        formData,
        organizationId: context.organization.id,
        userId: user.id
      });
      return NextResponse.json({ ok: true, message });
    }

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
      const recordId = textValue(formData, "recordId");
      const ruleDescription = textValue(formData, "ruleDescription");
      const frequency = textValue(formData, "frequency");
      const weekday = textValue(formData, "weekday");
      const weekOfMonth = textValue(formData, "weekOfMonth");
      const time = textValue(formData, "time");

      if (!legislatureId || !ruleDescription) {
        return NextResponse.json({ error: "Falta la regla de calendario de Pleno." }, { status: 400 });
      }

      const payload = {
        organization_id: context.organization.id,
        legislature_id: legislatureId,
        rule_description: ruleDescription,
        frequency: frequency || null,
        weekday: weekday || null,
        week_of_month: weekOfMonth ? Number(weekOfMonth) : null,
        time: time || null,
        exceptions: jsonArrayFromText(textValue(formData, "exceptions")),
        active: booleanFromForm(formData, "active"),
        updated_at: new Date().toISOString()
      };

      const { data, error } = recordId
        ? await adminClient
            .from("plenary_regular_schedule")
            .update(payload)
            .eq("id", recordId)
            .eq("organization_id", context.organization.id)
            .eq("legislature_id", legislatureId)
            .select("id")
            .single()
        : await adminClient.from("plenary_regular_schedule").insert(payload).select("id").single();

      if (error || !data) {
        throw new Error(error?.message ?? "No se ha podido guardar la regla de Pleno.");
      }

      await audit(context.organization.id, user.id, "legislature_plenary_schedule_saved", "plenary_regular_schedule", data.id as string, {
        ruleDescription
      });
      return NextResponse.json({ ok: true, message: "Regla de Pleno ordinario guardada." });
    }

    if (action === "discard-document") {
      const legislatureDocumentId = textValue(formData, "legislatureDocumentId");

      const { error } = await adminClient
        .from("legislature_documents")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", legislatureDocumentId)
        .eq("organization_id", context.organization.id);

      if (error) {
        throw new Error(error.message);
      }

      await audit(context.organization.id, user.id, "legislature_document_discarded", "legislature_documents", legislatureDocumentId, {});
      return NextResponse.json({ ok: true, message: "Documento descartado." });
    }

    if (action === "validate-legislature") {
      const legislatureId = textValue(formData, "legislatureId");
      const readiness = await getActivationReadiness(context.organization.id, legislatureId);

      if (readiness.missingRequired.length) {
        return NextResponse.json(
          { error: `No se puede activar. Faltan datos obligatorios: ${readiness.missingRequired.join(", ")}.` },
          { status: 400 }
        );
      }

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

      await audit(context.organization.id, user.id, "legislature_validated", "legislatures", legislatureId, readiness);
      return NextResponse.json({
        ok: true,
        message: readiness.missingRecommended.length
          ? `Legislatura activada. Recomendado completar: ${readiness.missingRecommended.join(", ")}.`
          : "Legislatura activada y validada."
      });
    }

    if (action === "generate-calendar") {
      const legislatureId = textValue(formData, "legislatureId");
      const count = await generateBaseCalendar(
        context.organization.id,
        user.id,
        legislatureId,
        textValue(formData, "rangeMode") || "current_year",
        textValue(formData, "rangeStart"),
        textValue(formData, "rangeEnd")
      );
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
