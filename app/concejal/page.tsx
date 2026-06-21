import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Euro,
  FileText,
  Flag,
  Landmark,
  Users,
  Vote
} from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import municipalProfile from "@/config/municipal-profile.json";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const tabs = [
  "Datos más relevantes",
  "Análisis fiscal y presupuestario",
  "Seguimiento institucional",
  "Contratación",
  "Programa electoral"
];

const relevantData = [
  {
    label: "Alertas asignadas",
    value: "5",
    detail: "Asuntos que requieren revisión del concejal",
    icon: AlertTriangle,
    tone: "critical"
  },
  {
    label: "Tareas pendientes",
    value: "9",
    detail: "Trabajo propio o compartido con el equipo",
    icon: ClipboardList,
    tone: "neutral"
  },
  {
    label: "Documentos a validar",
    value: "4",
    detail: "Informes, órdenes del día o expedientes",
    icon: FileText,
    tone: "neutral"
  },
  {
    label: "Próximos hitos",
    value: "3",
    detail: "Pleno, comisión o vencimiento relevante",
    icon: CalendarClock,
    tone: "strong"
  }
];

const budgetItems = [
  "Ejecución presupuestaria por áreas",
  "Modificaciones de crédito",
  "Ordenanzas fiscales y bonificaciones",
  "Partidas sin seguimiento político"
];

const institutionalItems = [
  "Preparación de plenos",
  "Comisiones asignadas",
  "Preguntas y ruegos pendientes",
  "Votaciones y acuerdos a seguir"
];

const contractItems = [
  "Contratos por área",
  "Prórrogas y vencimientos",
  "Importes relevantes",
  "Empresas adjudicatarias recurrentes"
];

const programItems = [
  "Medidas del programa electoral",
  "Iniciativas presentadas",
  "Medidas sin actividad asociada",
  "Cumplimiento o bloqueo político"
];

function OperationalPanel({
  title,
  description,
  icon: Icon,
  items
}: {
  title: string;
  description: string;
  icon: typeof Euro;
  items: string[];
}) {
  return (
    <article className="panel councillor-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Icon size={21} />
      </div>
      <div className="councillor-checklist">
        {items.map((item) => (
          <div key={item}>
            <CheckCircle2 size={17} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function CouncillorPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);
  const roleLabel = context?.membership.role === "admin" ? "Vista portavoz/admin" : "Vista concejal";

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <main className="private-main">
        <header className="private-page-header">
          <div>
            <span className="eyebrow">
              <Users size={16} />
              {roleLabel}
            </span>
            <h1>Panel de concejales</h1>
            <p>
              Espacio operativo para que cada concejal vea sus datos, tareas, documentos,
              seguimiento institucional y relación con el programa electoral de{" "}
              {municipalProfile.groupName}.
            </p>
          </div>
          <div className="private-header-card">
            <Vote size={20} />
            <span>Municipio</span>
            <strong>{municipalProfile.municipality.name}</strong>
          </div>
        </header>

        <nav className="dashboard-tabs" aria-label="Secciones del panel de concejal">
          {tabs.map((tab, index) => (
            <a data-active={index === 0} href={`#${tab.toLowerCase().replace(/\s+/g, "-")}`} key={tab}>
              {tab}
            </a>
          ))}
        </nav>

        <section className="metric-grid private-metric-grid" id="datos-más-relevantes">
          {relevantData.map((metric) => (
            <article className="metric-card command-metric-card" data-tone={metric.tone} key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <metric.icon size={18} />
              </header>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-note">{metric.detail}</div>
            </article>
          ))}
        </section>

        <section className="councillor-grid">
          <OperationalPanel
            description="Datos económicos que el concejal debe entender y poder convertir en iniciativa."
            icon={Euro}
            items={budgetItems}
            title="Análisis fiscal y presupuestario"
          />
          <OperationalPanel
            description="Plenos, comisiones, acuerdos y tareas institucionales asignadas."
            icon={Landmark}
            items={institutionalItems}
            title="Seguimiento institucional"
          />
          <OperationalPanel
            description="Control de contratos, adjudicaciones, prórrogas y posibles alertas."
            icon={BriefcaseBusiness}
            items={contractItems}
            title="Contratación"
          />
          <OperationalPanel
            description="Relación entre actividad del concejal, iniciativas y programa electoral."
            icon={Flag}
            items={programItems}
            title="Programa electoral"
          />
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Trabajo asignado</h2>
                <p>Tareas visibles para el concejal y también disponibles para el portavoz.</p>
              </div>
              <ClipboardList size={20} />
            </div>
            <div className="priority-list">
              {[
                "Revisar documentación de comisión informativa",
                "Preparar preguntas sobre contrato de servicios",
                "Relacionar iniciativa con medida del programa electoral"
              ].map((task) => (
                <article className="priority-item" key={task}>
                  <div>
                    <span className="priority-area">Asignada</span>
                    <h3>{task}</h3>
                  </div>
                  <div className="priority-meta">
                    <strong>Esta semana</strong>
                    <span className="badge green">Pendiente</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Próximas decisiones</h2>
                <p>Aspectos del proceso que deberá terminar de definir el portavoz.</p>
              </div>
              <BarChart3 size={20} />
            </div>
            <div className="process-list">
              {[
                "Qué métricas ve cada concejal y cuáles solo el portavoz",
                "Qué tareas puede crear un concejal y cuáles requieren aprobación",
                "Qué datos presupuestarios se muestran por área",
                "Cómo se validan las medidas del programa electoral"
              ].map((item) => (
                <article className="process-card" key={item}>
                  <div>
                    <CheckCircle2 size={17} />
                    <strong>{item}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
