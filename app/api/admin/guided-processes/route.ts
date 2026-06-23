import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { safeFilename, textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { DocumentKind, GuidedProcessType, OperationalPriority, PlenarySessionType } from "@/lib/types";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain"
]);

const plenaryTasks = [
  "Revisar orden del dia",
  "Identificar expedientes relevantes",
  "Preparar preguntas",
  "Preparar intervencion sobre mociones propias",
  "Revisar votaciones previsibles",
  "Preparar argumentario politico",
  "Preparar nota o contenido de comunicacion si procede"
];

const committeeTasks = [
  "Revisar expedientes incluidos",
  "Solicitar documentacion adicional si procede",
  "Preparar preguntas para comision",
  "Marcar asuntos relevantes para Pleno",
  "Elaborar informe interno de comision"
];

function toIsoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dueBefore(baseIso: string, hoursBefore: number) {
  const date = new Date(baseIso);
  date.setHours(date.getHours() - hoursBefore);
  return date.toISOString();
}

async function createBaseDocument({
  file,
  kind,
  organizationId,
  userId,
  title,
  governingBody,
  officialDate
}: {
  file: File;
  kind: DocumentKind;
  organizationId: string;
  userId: string;
  title: string;
  governingBody: string;
  officialDate: string | null;
}) {
  const adminClient = getSupabaseAdminClient();
  const { data: documentRow, error: documentError } = await adminClient
    .from("documents")
    .insert({
      organization_id: organizationId,
      kind,
      title,
      source_name: "Proceso guiado",
      official_date: officialDate,
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
  const storagePath = `${organizationId}/guided-processes/${documentRow.id}/${filename}`;
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
    summary: "Documento cargado mediante proceso guiado. Pendiente de extraccion inteligente.",
    structured_data: {
      extractionStatus: "pending_text_extraction",
      humanReviewRequired: true,
      guidedProcess: true
    },
    model: "pending"
  });

  return {
    documentId: documentRow.id as string,
    storagePath
  };
}

async function createTasks({
  organizationId,
  userId,
  assignedTo,
  titles,
  baseDueAt,
  relatedEntityType,
  relatedEntityId
}: {
  organizationId: string;
  userId: string;
  assignedTo: string | null;
  titles: string[];
  baseDueAt: string;
  relatedEntityType: string;
  relatedEntityId: string;
}) {
  const rows = titles.map((title, index) => ({
    organization_id: organizationId,
    title,
    description: "Tarea generada automaticamente por proceso guiado.",
    status: "pending",
    priority: (index < 2 ? "high" : "medium") satisfies OperationalPriority,
    assigned_to: assignedTo,
    created_by: userId,
    due_at: dueBefore(baseDueAt, 24 + index * 6),
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId
  }));

  const { data, error } = await getSupabaseAdminClient().from("tasks").insert(rows).select("id");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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

async function createProcessRun({
  organizationId,
  userId,
  processType,
  title,
  relatedEntityType,
  relatedEntityId,
  sourceDocumentId,
  metadata
}: {
  organizationId: string;
  userId: string;
  processType: GuidedProcessType;
  title: string;
  relatedEntityType: string;
  relatedEntityId: string;
  sourceDocumentId: string;
  metadata: Record<string, unknown>;
}) {
  const { data, error } = await getSupabaseAdminClient()
    .from("process_runs")
    .insert({
      organization_id: organizationId,
      process_type: processType,
      title,
      status: "completed",
      started_by: userId,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      source_document_id: sourceDocumentId,
      metadata
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se ha podido registrar el proceso guiado.");
  }

  return data.id as string;
}

async function importPlenaryAgenda(formData: FormData, organizationId: string, userId: string) {
  const file = formData.get("file");
  const title = textValue(formData, "title") || "Orden del dia de Pleno";
  const startsAt = toIsoDateTime(textValue(formData, "startsAt"));
  const sessionType = (textValue(formData, "sessionType") || "ordinary") as PlenarySessionType;
  const assignedTo = textValue(formData, "assignedTo") || null;

  if (!(file instanceof File) || !startsAt) {
    throw new Error("Debes subir documento e indicar fecha y hora del pleno.");
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error("Solo se admiten PDF, DOCX, DOC y TXT.");
  }

  const adminClient = getSupabaseAdminClient();
  const { documentId, storagePath } = await createBaseDocument({
    file,
    kind: "agenda",
    organizationId,
    userId,
    title,
    governingBody: "Pleno",
    officialDate: startsAt.slice(0, 10)
  });

  const { data: plenary, error: plenaryError } = await adminClient
    .from("plenary_sessions")
    .insert({
      organization_id: organizationId,
      title,
      session_type: sessionType,
      session_date: startsAt,
      status: "scheduled",
      agenda_document_id: documentId
    })
    .select("id")
    .single();

  if (plenaryError || !plenary) {
    throw new Error(plenaryError?.message ?? "No se ha podido crear el pleno.");
  }

  const plenaryId = plenary.id as string;
  const { data: event } = await adminClient
    .from("calendar_events")
    .insert({
      organization_id: organizationId,
      title: `Pleno: ${title}`,
      description: "Evento creado automaticamente desde orden del dia.",
      event_type: "pleno",
      starts_at: startsAt,
      status: "scheduled",
      related_entity_type: "plenary_sessions",
      related_entity_id: plenaryId,
      created_by: userId
    })
    .select("id")
    .single();

  const { data: alert } = await adminClient
    .from("alerts")
    .insert({
      organization_id: organizationId,
      title: "Preparar Pleno",
      description: `Preparar seguimiento politico del pleno: ${title}`,
      category: "plenary_preparation",
      priority: "high",
      status: "open",
      due_at: dueBefore(startsAt, 24),
      created_by: userId,
      assigned_to: assignedTo,
      related_entity_type: "plenary_sessions",
      related_entity_id: plenaryId,
      recommended_action: "Revisar orden del dia, expedientes, preguntas, intervenciones y comunicacion.",
      source: "Proceso guiado"
    })
    .select("id")
    .single();

  const tasks = await createTasks({
    organizationId,
    userId,
    assignedTo,
    titles: plenaryTasks,
    baseDueAt: startsAt,
    relatedEntityType: "plenary_sessions",
    relatedEntityId: plenaryId
  });

  const processRunId = await createProcessRun({
    organizationId,
    userId,
    processType: "import_plenary_agenda",
    title,
    relatedEntityType: "plenary_sessions",
    relatedEntityId: plenaryId,
    sourceDocumentId: documentId,
    metadata: {
      documentId,
      storagePath,
      eventId: event?.id ?? null,
      alertId: alert?.id ?? null,
      taskIds: tasks.map((task) => task.id)
    }
  });

  await Promise.all([
    audit(organizationId, userId, "guided_process_started", "process_runs", processRunId, { processType: "import_plenary_agenda" }),
    audit(organizationId, userId, "guided_document_uploaded", "documents", documentId, { processRunId }),
    audit(organizationId, userId, "plenary_session_auto_created", "plenary_sessions", plenaryId, { processRunId })
  ]);

  return { processRunId, relatedEntityId: plenaryId };
}

async function importCommitteeCall(formData: FormData, organizationId: string, userId: string) {
  const file = formData.get("file");
  const committeeName = textValue(formData, "committeeName");
  const title = textValue(formData, "title") || `Convocatoria de comision${committeeName ? ` - ${committeeName}` : ""}`;
  const startsAt = toIsoDateTime(textValue(formData, "startsAt"));
  const assignedTo = textValue(formData, "assignedTo") || null;

  if (!(file instanceof File) || !startsAt || !committeeName) {
    throw new Error("Debes subir documento, indicar comision y fecha.");
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error("Solo se admiten PDF, DOCX, DOC y TXT.");
  }

  const adminClient = getSupabaseAdminClient();
  const { documentId, storagePath } = await createBaseDocument({
    file,
    kind: "agenda",
    organizationId,
    userId,
    title,
    governingBody: committeeName,
    officialDate: startsAt.slice(0, 10)
  });

  const { data: committee, error: committeeError } = await adminClient
    .from("committees")
    .upsert(
      {
        organization_id: organizationId,
        name: committeeName,
        responsible_councillor_id: assignedTo,
        active: true
      },
      { onConflict: "organization_id,name" }
    )
    .select("id")
    .single();

  if (committeeError || !committee) {
    throw new Error(committeeError?.message ?? "No se ha podido crear la comision.");
  }

  const { data: session, error: sessionError } = await adminClient
    .from("committee_sessions")
    .insert({
      organization_id: organizationId,
      committee_id: committee.id,
      title,
      session_date: startsAt,
      status: "scheduled",
      agenda_document_id: documentId
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(sessionError?.message ?? "No se ha podido crear la sesion de comision.");
  }

  const sessionId = session.id as string;
  const { data: event } = await adminClient
    .from("calendar_events")
    .insert({
      organization_id: organizationId,
      title: `Comision: ${committeeName}`,
      description: "Evento creado automaticamente desde convocatoria de comision.",
      event_type: "comision",
      starts_at: startsAt,
      status: "scheduled",
      related_entity_type: "committee_sessions",
      related_entity_id: sessionId,
      created_by: userId
    })
    .select("id")
    .single();

  const { data: alert } = await adminClient
    .from("alerts")
    .insert({
      organization_id: organizationId,
      title: "Preparar comision",
      description: `Preparar trabajo de comision: ${committeeName}`,
      category: "committee_preparation",
      priority: "medium",
      status: "open",
      due_at: dueBefore(startsAt, 12),
      created_by: userId,
      assigned_to: assignedTo,
      related_entity_type: "committee_sessions",
      related_entity_id: sessionId,
      recommended_action: "Revisar expedientes, preguntas y asuntos elevables a Pleno.",
      source: "Proceso guiado"
    })
    .select("id")
    .single();

  const tasks = await createTasks({
    organizationId,
    userId,
    assignedTo,
    titles: committeeTasks,
    baseDueAt: startsAt,
    relatedEntityType: "committee_sessions",
    relatedEntityId: sessionId
  });

  const processRunId = await createProcessRun({
    organizationId,
    userId,
    processType: "import_committee_call",
    title,
    relatedEntityType: "committee_sessions",
    relatedEntityId: sessionId,
    sourceDocumentId: documentId,
    metadata: {
      committeeId: committee.id,
      documentId,
      storagePath,
      eventId: event?.id ?? null,
      alertId: alert?.id ?? null,
      taskIds: tasks.map((task) => task.id)
    }
  });

  await Promise.all([
    audit(organizationId, userId, "guided_process_started", "process_runs", processRunId, { processType: "import_committee_call" }),
    audit(organizationId, userId, "guided_document_uploaded", "documents", documentId, { processRunId }),
    audit(organizationId, userId, "committee_session_auto_created", "committee_sessions", sessionId, { processRunId })
  ]);

  return { processRunId, relatedEntityId: sessionId };
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const processType = textValue(formData, "processType") as GuidedProcessType;

  try {
    const result =
      processType === "import_plenary_agenda"
        ? await importPlenaryAgenda(formData, context.organization.id, user.id)
        : processType === "import_committee_call"
          ? await importCommitteeCall(formData, context.organization.id, user.id)
          : null;

    if (!result) {
      return NextResponse.json({ error: "Proceso guiado no implementado todavia." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Proceso guiado completado. Se han creado documento, expediente interno, calendario, alerta y tareas.",
      ...result
    });
  } catch (error) {
    await getSupabaseAdminClient().from("audit_log").insert({
      organization_id: context.organization.id,
      actor_user_id: user.id,
      action: "guided_process_failed",
      target_table: "process_runs",
      metadata: {
        processType,
        error: error instanceof Error ? error.message : "Error desconocido"
      }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido completar el proceso guiado." },
      { status: 400 }
    );
  }
}
