import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FilePlus2,
  FileText,
  FolderKanban,
  Gauge,
  MessageCircleQuestion,
  Search,
  Target,
  Users,
  Vote
} from "lucide-react";
import { redirect } from "next/navigation";
import { AppBreadcrumbs } from "@/components/app/breadcrumbs";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { GuidedProcessForms } from "@/components/admin/guided-process-forms";
import { OperationalForms } from "@/components/admin/operational-forms";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getSituationRoomData } from "@/lib/data/operational";
import municipalProfile from "@/config/municipal-profile.json";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const trackingBlocks = [
  {
    title: "Seguimiento de expedientes",
    value: "18",
    detail: "Urbanismo, personal, servicios públicos y solicitudes de información.",
    icon: FolderKanban
  },
  {
    title: "Seguimiento de contratos",
    value: "9",
    detail: "Adjudicaciones, prórrogas, importes y órganos de contratación.",
    icon: FileCheck2
  },
  {
    title: "Preguntas de vecinos",
    value: "24",
    detail: "Entradas ciudadanas para transformar en preguntas, ruegos o iniciativas.",
    icon: MessageCircleQuestion
  },
  {
    title: "Documentos a validar",
    value: "12",
    detail: "Documentación cargada y pendiente de revisión humana.",
    icon: FileText
  }
];

const processDefinitions = [
  {
    title: "Pleno",
    steps: ["Orden del día", "Análisis político", "Preguntas", "Intervenciones", "Votaciones"]
  },
  {
    title: "Comisiones",
    steps: ["Convocatoria", "Documentación", "Responsable", "Preguntas", "Seguimiento"]
  },
  {
    title: "Mociones e iniciativas",
    steps: ["Borrador", "Registro", "Debate", "Votación", "Relación con programa"]
  },
  {
    title: "Programa electoral",
    steps: ["Carga completa", "Medidas", "Iniciativas asociadas", "Cumplimiento", "Alertas"]
  }
];

const currentTasks = [
  {
    title: "Asignar análisis del próximo pleno",
    owner: "Portavoz",
    deadline: "48 h",
    status: "Prioridad alta"
  },
  {
    title: "Relacionar mociones presentadas con programa electoral",
    owner: "Equipo político",
    deadline: "Esta semana",
    status: "Pendiente"
  },
  {
    title: "Validar documentos estratégicos cargados",
    owner: "Administración",
    deadline: "7 días",
    status: "En revisión"
  }
];

function roleLabel(role: string) {
  return role === "spokesperson" ? "Usuario portavoz" : "Usuario administrador";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);

  if (!context || !["admin", "spokesperson"].includes(context.membership.role)) {
    redirect("/concejal");
  }

  const adminClient = getSupabaseAdminClient();
  const [situation, { data: teamMemberships }] = await Promise.all([
    getSituationRoomData(context.organization.id),
    adminClient
      .from("memberships")
      .select("role, profiles(id, full_name, email)")
      .eq("organization_id", context.organization.id)
      .eq("active", true)
  ]);

  const teamRows = (teamMemberships ?? []) as unknown as {
    role: string;
    profiles:
      | {
          id: string;
          full_name: string | null;
          email: string | null;
        }
      | {
          id: string;
          full_name: string | null;
          email: string | null;
        }[]
      | null;
  }[];

  const team = teamRows
    .map((member) => ({
      role: member.role,
      profile: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
    }))
    .filter(
      (member): member is {
        role: string;
        profile: {
          id: string;
          full_name: string | null;
          email: string | null;
        };
      } => Boolean(member.profile)
    )
    .map((member) => ({
      id: member.profile.id,
      label: member.profile.full_name || member.profile.email || "Usuario sin nombre",
      role: member.role
    }));

  const liveCommandBlocks = [
    {
      title: "Alertas",
      value: String(situation.alerts.length),
      detail: "Alertas abiertas reales generadas o creadas por el portavoz.",
      icon: AlertTriangle,
      tone: situation.alerts.length ? "critical" : "neutral"
    },
    {
      title: "Calendario",
      value: String(situation.upcomingEvents.length),
      detail: "Eventos institucionales y plazos de los proximos 30 dias.",
      icon: CalendarClock,
      tone: "strong"
    },
    {
      title: "Tareas pendientes",
      value: String(situation.assignedTasks.length),
      detail: "Tareas abiertas registradas en la base operativa.",
      icon: CheckCircle2,
      tone: "neutral"
    },
    {
      title: "Equipo",
      value: String(team.length),
      detail: "Usuarios activos del grupo municipal configurados en Supabase.",
      icon: Users,
      tone: "neutral"
    }
  ];

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <main className="private-main">
        <header className="private-page-header">
          <div>
            <AppBreadcrumbs
              icon={<Target size={16} />}
              items={[{ href: "/dashboard", label: roleLabel(context.membership.role) }, { label: "Panel de direccion" }]}
            />
            <h1>{municipalProfile.groupName}</h1>
            <p>Alertas, calendario, tareas y procesos activos del mandato {municipalProfile.municipality.mandate}.</p>
          </div>
          <div className="private-header-actions">
            <button className="button" type="button">
              <Search size={17} />
              Buscar
            </button>
            <a className="button primary" href="/admin/config">
              <FilePlus2 size={17} />
              Subir documento
            </a>
          </div>
        </header>

        <section className="metric-grid private-metric-grid">
          {liveCommandBlocks.map((block) => (
            <article className="metric-card command-metric-card" data-tone={block.tone} key={block.title}>
              <header>
                <span>{block.title}</span>
                <block.icon size={18} />
              </header>
              <div className="metric-value">{block.value}</div>
              <div className="metric-note">{block.detail}</div>
            </article>
          ))}
        </section>

        <section className="tracking-grid">
          {trackingBlocks.map((block) => (
            <article className="tracking-card" key={block.title}>
              <div className="tracking-icon">
                <block.icon size={20} />
              </div>
              <div>
                <h2>{block.title}</h2>
                <strong>{block.value}</strong>
                <p>{block.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="panel guided-process-panel">
          <div className="panel-header">
            <div>
              <h2>Procesos guiados</h2>
              <p>Una accion natural del portavoz crea documento, expediente interno, calendario, alerta y tareas.</p>
            </div>
            <FilePlus2 size={20} />
          </div>
          <GuidedProcessForms team={team} />
        </section>

        <section className="private-dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Tareas para asignar o revisar</h2>
                <p>El portavoz debe poder convertir cualquier asunto en trabajo asignado.</p>
              </div>
              <ClipboardList size={20} />
            </div>
            <div className="priority-list">
              {currentTasks.map((item) => (
                <article className="priority-item" key={item.title}>
                  <div>
                    <span className="priority-area">{item.owner}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="priority-meta">
                    <strong>{item.deadline}</strong>
                    <span className="badge green">{item.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Procesos a definir</h2>
                <p>Partes e hitos que debe manejar cada módulo.</p>
              </div>
              <Gauge size={20} />
            </div>
            <div className="process-list">
              {processDefinitions.map((process) => (
                <article className="process-card" key={process.title}>
                  <div>
                    <Vote size={17} />
                    <strong>{process.title}</strong>
                  </div>
                  <p>{process.steps.join(" · ")}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Herramientas avanzadas</h2>
              <p>
                Alta manual de alertas, tareas y eventos cuando no proceda iniciar un proceso guiado.
              </p>
            </div>
            <FilePlus2 size={20} />
          </div>
          <OperationalForms team={team} />
        </section>
      </main>
    </div>
  );
}
