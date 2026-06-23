import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { CalendarEventType, OperationalPriority } from "@/lib/types";

const priorities = new Set<OperationalPriority>(["low", "medium", "high", "critical"]);
const eventTypes = new Set<CalendarEventType>([
  "pleno",
  "comision",
  "junta_portavoces",
  "consejo",
  "reunion",
  "acto",
  "plazo",
  "otro"
]);

function optionalDateTime(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function optionalUuid(value: string) {
  return value || null;
}

async function writeAudit(
  organizationId: string,
  userId: string,
  action: string,
  targetTable: string,
  targetId: string,
  metadata: Record<string, unknown>
) {
  await getSupabaseAdminClient().from("audit_log").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata
  });
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const action = textValue(formData, "action");
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const priority = textValue(formData, "priority") as OperationalPriority;
  const assignedTo = optionalUuid(textValue(formData, "assignedTo"));
  const relatedEntityType = textValue(formData, "relatedEntityType") || null;
  const relatedEntityId = optionalUuid(textValue(formData, "relatedEntityId"));
  const adminClient = getSupabaseAdminClient();

  if (!title) {
    return NextResponse.json({ error: "El titulo es obligatorio." }, { status: 400 });
  }

  if (action === "alert") {
    if (!priorities.has(priority)) {
      return NextResponse.json({ error: "Prioridad no valida." }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("alerts")
      .insert({
        organization_id: context.organization.id,
        title,
        description: description || null,
        category: textValue(formData, "category") || "manual",
        priority,
        due_at: optionalDateTime(textValue(formData, "dueAt")),
        created_by: user.id,
        assigned_to: assignedTo,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        recommended_action: textValue(formData, "recommendedAction") || null,
        source: "Creacion manual"
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "No se ha podido crear la alerta." }, { status: 400 });
    }

    await writeAudit(context.organization.id, user.id, "alert_created", "alerts", data.id, { title, priority });
    return NextResponse.json({ ok: true, message: "Alerta creada correctamente." });
  }

  if (action === "task") {
    if (!priorities.has(priority)) {
      return NextResponse.json({ error: "Prioridad no valida." }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("tasks")
      .insert({
        organization_id: context.organization.id,
        title,
        description: description || null,
        priority,
        assigned_to: assignedTo,
        created_by: user.id,
        due_at: optionalDateTime(textValue(formData, "dueAt")),
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "No se ha podido crear la tarea." }, { status: 400 });
    }

    await writeAudit(context.organization.id, user.id, "task_created", "tasks", data.id, { title, priority, assignedTo });
    return NextResponse.json({ ok: true, message: "Tarea creada correctamente." });
  }

  if (action === "calendar_event") {
    const eventType = textValue(formData, "eventType") as CalendarEventType;
    const startsAt = optionalDateTime(textValue(formData, "startsAt"));

    if (!eventTypes.has(eventType) || !startsAt) {
      return NextResponse.json({ error: "Tipo de evento o fecha de inicio no validos." }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("calendar_events")
      .insert({
        organization_id: context.organization.id,
        title,
        description: description || null,
        event_type: eventType,
        starts_at: startsAt,
        ends_at: optionalDateTime(textValue(formData, "endsAt")),
        location: textValue(formData, "location") || null,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        created_by: user.id
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "No se ha podido crear el evento." }, { status: 400 });
    }

    await writeAudit(context.organization.id, user.id, "calendar_event_created", "calendar_events", data.id, {
      title,
      eventType
    });
    return NextResponse.json({ ok: true, message: "Evento creado correctamente." });
  }

  return NextResponse.json({ error: "Accion operativa no reconocida." }, { status: 400 });
}
