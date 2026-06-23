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
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import municipalProfile from "@/config/municipal-profile.json";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const commandBlocks = [
  {
    title: "Alertas",
    value: "7",
    detail: "Plazos, programa electoral, expedientes sensibles y riesgos jurídicos.",
    icon: AlertTriangle,
    tone: "critical"
  },
  {
    title: "Calendario",
    value: "3",
    detail: "Pleno, comisiones y vencimientos políticos de la semana.",
    icon: CalendarClock,
    tone: "strong"
  },
  {
    title: "Tareas pendientes",
    value: "16",
    detail: "Asignadas a concejales, asesores y comunicación.",
    icon: CheckCircle2,
    tone: "neutral"
  },
  {
    title: "Equipo",
    value: "4",
    detail: "Concejales del grupo municipal y responsabilidades abiertas.",
    icon: Users,
    tone: "neutral"
  }
];

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

export default async function DashboardPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);

  if (!["admin", "spokesperson"].includes(context?.membership.role ?? "")) {
    redirect("/concejal");
  }

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <main className="private-main">
        <header className="private-page-header">
          <div>
            <span className="eyebrow">
              <Target size={16} />
              Panel privado de dirección
            </span>
            <h1>Panel privado de dirección</h1>
            <p>
              Vista de trabajo para {municipalProfile.groupName}: alertas, calendario, tareas,
              equipo y seguimiento de los procesos políticos e institucionales del mandato{" "}
              {municipalProfile.municipality.mandate}.
            </p>
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
          {commandBlocks.map((block) => (
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
      </main>
    </div>
  );
}
