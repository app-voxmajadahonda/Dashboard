import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Alert,
  CalendarEvent,
  Committee,
  CommitteeSession,
  InstitutionalRequest,
  Motion,
  PlenarySession,
  Task,
  Vote
} from "@/lib/types";

const activeAlertStatuses = ["open", "in_review"];
const activeTaskStatuses = ["pending", "in_progress", "blocked"];
const priorityWeight = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

function emptyOnError<T>(value: T[] | null | undefined) {
  return (value ?? []) as T[];
}

function sortAlerts(alerts: Alert[]) {
  return [...alerts].sort((a, b) => {
    const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function addHours(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export async function getAlerts(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("alerts")
      .select("*")
      .eq("organization_id", organizationId)
      .in("status", activeAlertStatuses)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(20);

    return sortAlerts(emptyOnError<Alert>(data));
  } catch {
    return [];
  }
}

export async function getTasks(organizationId: string, userId?: string) {
  try {
    let query = getSupabaseAdminClient()
      .from("tasks")
      .select("*")
      .eq("organization_id", organizationId)
      .in("status", activeTaskStatuses)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(30);

    if (userId) {
      query = query.eq("assigned_to", userId);
    }

    const { data } = await query;
    return emptyOnError<Task>(data);
  } catch {
    return [];
  }
}

export async function getCalendarEvents(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("calendar_events")
      .select("*")
      .eq("organization_id", organizationId)
      .order("starts_at", { ascending: true })
      .limit(60);

    return emptyOnError<CalendarEvent>(data);
  } catch {
    return [];
  }
}

export async function getUpcomingInstitutionalEvents(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("calendar_events")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("starts_at", new Date().toISOString())
      .lte("starts_at", addDays(30))
      .order("starts_at", { ascending: true })
      .limit(12);

    return emptyOnError<CalendarEvent>(data);
  } catch {
    return [];
  }
}

export async function getPlenarySessions(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("plenary_sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("session_date", { ascending: false })
      .limit(20);

    return emptyOnError<PlenarySession>(data);
  } catch {
    return [];
  }
}

export async function getCommittees(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("committees")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .order("name", { ascending: true });

    return emptyOnError<Committee>(data);
  } catch {
    return [];
  }
}

export async function getCommitteeSessions(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("committee_sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("session_date", { ascending: false })
      .limit(20);

    return emptyOnError<CommitteeSession>(data);
  } catch {
    return [];
  }
}

export async function getMotions(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("motions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(30);

    return emptyOnError<Motion>(data);
  } catch {
    return [];
  }
}

export async function getInstitutionalRequests(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("institutional_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(40);

    return emptyOnError<InstitutionalRequest>(data);
  } catch {
    return [];
  }
}

export async function getOverdueRequests(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("institutional_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .in("status", ["pending_response", "registered"])
      .lt("due_at", new Date().toISOString())
      .order("due_at", { ascending: true })
      .limit(20);

    return emptyOnError<InstitutionalRequest>(data);
  } catch {
    return [];
  }
}

export async function getVotes(organizationId: string) {
  try {
    const { data } = await getSupabaseAdminClient()
      .from("votes")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(40);

    return emptyOnError<Vote>(data);
  } catch {
    return [];
  }
}

async function upsertAlert(alert: Pick<
  Alert,
  | "organization_id"
  | "title"
  | "description"
  | "category"
  | "priority"
  | "status"
  | "due_at"
  | "assigned_to"
  | "related_entity_type"
  | "related_entity_id"
  | "recommended_action"
  | "source"
>) {
  await getSupabaseAdminClient().from("alerts").upsert(
    {
      ...alert,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "organization_id,category,related_entity_type,related_entity_id"
    }
  );
}

export async function generateBasicOperationalAlerts(organizationId: string) {
  try {
    const [overdueRequests, urgentTasks, upcomingPlenaries, followUpMotions] = await Promise.all([
      getOverdueRequests(organizationId),
      getSupabaseAdminClient()
        .from("tasks")
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["pending", "in_progress", "blocked"])
        .lte("due_at", addHours(48))
        .gte("due_at", new Date().toISOString())
        .limit(20),
      getSupabaseAdminClient()
        .from("plenary_sessions")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "scheduled")
        .lte("session_date", addDays(7))
        .gte("session_date", new Date().toISOString())
        .limit(10),
      getSupabaseAdminClient()
        .from("motions")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "approved")
        .or("follow_up_status.is.null,follow_up_status.eq.follow_up")
        .limit(20)
    ]);

    await Promise.all([
      ...overdueRequests.map((request) =>
        upsertAlert({
          organization_id: organizationId,
          title: `Solicitud vencida: ${request.title}`,
          description: request.description,
          category: "request_overdue",
          priority: "high",
          status: "open",
          due_at: request.due_at,
          assigned_to: request.responsible_councillor_id,
          related_entity_type: "institutional_requests",
          related_entity_id: request.id,
          recommended_action: "Reiterar solicitud, preparar queja o elevar al portavoz.",
          source: "Regla automatica"
        })
      ),
      ...emptyOnError<Task>(urgentTasks.data).map((task) =>
        upsertAlert({
          organization_id: organizationId,
          title: `Tarea vence pronto: ${task.title}`,
          description: task.description,
          category: "task_due_48h",
          priority: task.priority === "critical" ? "critical" : "high",
          status: "open",
          due_at: task.due_at,
          assigned_to: task.assigned_to,
          related_entity_type: "tasks",
          related_entity_id: task.id,
          recommended_action: "Revisar avance y desbloquear antes del vencimiento.",
          source: "Regla automatica"
        })
      ),
      ...emptyOnError<PlenarySession>(upcomingPlenaries.data).map((session) =>
        upsertAlert({
          organization_id: organizationId,
          title: `Pleno proximo: ${session.title}`,
          description: session.political_summary,
          category: "plenary_7d",
          priority: "high",
          status: "open",
          due_at: session.session_date,
          assigned_to: null,
          related_entity_type: "plenary_sessions",
          related_entity_id: session.id,
          recommended_action: "Cerrar preguntas, intervenciones, mociones y documentacion antes del pleno.",
          source: "Regla automatica"
        })
      ),
      ...emptyOnError<Motion>(followUpMotions.data).map((motion) =>
        upsertAlert({
          organization_id: organizationId,
          title: `Mocion aprobada sin seguimiento: ${motion.title}`,
          description: motion.result,
          category: "motion_follow_up",
          priority: "medium",
          status: "open",
          due_at: null,
          assigned_to: motion.responsible_councillor_id,
          related_entity_type: "motions",
          related_entity_id: motion.id,
          recommended_action: "Revisar grado de ejecucion y preparar iniciativa de control si procede.",
          source: "Regla automatica"
        })
      )
    ]);
  } catch {
    return;
  }
}

export async function getSituationRoomData(organizationId: string, userId?: string) {
  await generateBasicOperationalAlerts(organizationId);

  const [
    alerts,
    assignedTasks,
    upcomingEvents,
    plenarySessions,
    committeeSessions,
    motions,
    institutionalRequests,
    overdueRequests,
    votes
  ] = await Promise.all([
    getAlerts(organizationId),
    getTasks(organizationId, userId),
    getUpcomingInstitutionalEvents(organizationId),
    getPlenarySessions(organizationId),
    getCommitteeSessions(organizationId),
    getMotions(organizationId),
    getInstitutionalRequests(organizationId),
    getOverdueRequests(organizationId),
    getVotes(organizationId)
  ]);

  const now = Date.now();
  const nextPlenary =
    plenarySessions
      .filter((session) => new Date(session.session_date).getTime() >= now)
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())[0] ?? null;

  return {
    alerts,
    assignedTasks,
    upcomingEvents,
    nextPlenary,
    upcomingCommittees: committeeSessions
      .filter((session) => new Date(session.session_date).getTime() >= now)
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
      .slice(0, 5),
    pendingMotions: motions.filter((motion) => ["draft", "registered", "follow_up"].includes(motion.status)).slice(0, 8),
    institutionalRequests,
    overdueRequests,
    votes
  };
}
