import {
  AlertTriangle,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  FilePlus2,
  FileText,
  FolderKanban,
  Gauge,
  Landmark,
  Search,
  Target,
  Vote
} from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import municipalProfile from "@/config/municipal-profile.json";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const commandMetrics = [
  {
    label: "Alertas críticas",
    value: "7",
    note: "Plazos, riesgos jurídicos o asuntos sensibles",
    icon: AlertTriangle,
    tone: "critical"
  },
  {
    label: "Pleno y comisiones",
    value: "3",
    note: "Hitos políticos que preparar esta semana",
    icon: Vote,
    tone: "strong"
  },
  {
    label: "Expedientes prioritarios",
    value: "18",
    note: "Contratos, decretos y urbanismo en seguimiento",
    icon: FolderKanban,
    tone: "neutral"
  },
  {
    label: "Documentos por validar",
    value: "12",
    note: "Pendientes de clasificación y revisión humana",
    icon: FileText,
    tone: "neutral"
  }
];

const sections = [
  {
    title: "Pleno y comisiones",
    icon: Vote,
    items: ["Orden del día", "Preguntas", "Ruegos", "Mociones", "Calendario"]
  },
  {
    title: "Fiscalización",
    icon: Landmark,
    items: ["Decretos", "Contratos", "Presupuesto", "Expedientes", "Solicitudes"]
  },
  {
    title: "Documentación",
    icon: FileText,
    items: ["Ordenanzas", "ROM", "Presupuesto", "Delegaciones", "Informes"]
  },
  {
    title: "Comunicación",
    icon: BellRing,
    items: ["Notas", "Campañas", "Redes", "Argumentarios", "Alertas"]
  }
];

const priorities = [
  {
    title: "Preparar posición para el próximo pleno",
    area: "Pleno",
    deadline: "48 h",
    status: "Prioridad alta"
  },
  {
    title: "Revisar decretos con impacto presupuestario",
    area: "Decretos",
    deadline: "Esta semana",
    status: "En revisión"
  },
  {
    title: "Cerrar argumentario de seguridad y limpieza",
    area: "Comunicación",
    deadline: "Antes del viernes",
    status: "Pendiente"
  }
];

const milestones = [
  {
    date: "Hoy",
    title: "Revisión de alertas institucionales",
    detail: "Contratos, decretos y asuntos con vencimiento próximo"
  },
  {
    date: "24 h",
    title: "Validación de documentos entrantes",
    detail: "Clasificar documentación y asignar responsable político"
  },
  {
    date: "Semana",
    title: "Preparación de comisiones informativas",
    detail: "Preguntas, ruegos, mociones y solicitudes de expediente"
  }
];

export default async function DashboardPage() {
  await requireUser();

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
            <h1>Mesa del portavoz</h1>
            <p>
              Vista inicial de trabajo para {municipalProfile.groupName}: prioridades, alertas,
              documentos pendientes y próximos hitos políticos del mandato{" "}
              {municipalProfile.municipality.mandate}.
            </p>
          </div>
          <div className="private-header-actions">
            <button className="button" type="button">
              <Search size={17} />
              Buscar
            </button>
            <button className="button primary" type="button">
              <FilePlus2 size={17} />
              Subir documento
            </button>
          </div>
        </header>

        <section className="section-strip">
          {sections.map((section) => (
            <article className="section-card" key={section.title}>
              <header>
                <section.icon size={20} />
                <strong>{section.title}</strong>
              </header>
              <div>
                {section.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="metric-grid private-metric-grid">
          {commandMetrics.map((metric) => (
            <article className="metric-card command-metric-card" data-tone={metric.tone} key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <metric.icon size={18} />
              </header>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-note">{metric.note}</div>
            </article>
          ))}
        </section>

        <section className="private-dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Prioridades del portavoz</h2>
                <p>Asuntos que deberían concentrar la atención política inmediata.</p>
              </div>
              <Gauge size={20} />
            </div>
            <div className="priority-list">
              {priorities.map((item) => (
                <article className="priority-item" key={item.title}>
                  <div>
                    <span className="priority-area">{item.area}</span>
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
                <h2>Próximos hitos</h2>
                <p>Resumen temporal para decidir y asignar trabajo.</p>
              </div>
              <CalendarClock size={20} />
            </div>
            <div className="timeline-list">
              {milestones.map((item) => (
                <article className="timeline-item" key={item.title}>
                  <span>{item.date}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel dashboard-note-panel">
          <div className="panel-header">
            <div>
              <h2>Próximo bloque de trabajo</h2>
              <p>
                La configuración será la pieza que alimente el resto del sistema: fuentes,
                ordenanzas, presupuestos, ROM, delegaciones y automatizaciones.
              </p>
            </div>
            <Bot size={20} />
          </div>
          <div className="quick-action-grid">
            <a className="button primary" href="/admin/config">Ir a configuración</a>
            <button className="button" type="button">Ver documentos pendientes</button>
            <button className="button" type="button">Revisar alertas</button>
            <button className="button" type="button">
              <CheckCircle2 size={17} />
              Asignar tareas
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
