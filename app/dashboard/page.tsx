import {
  AlertTriangle,
  Archive,
  BellRing,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Database,
  Euro,
  FilePlus2,
  FileText,
  FolderKanban,
  Gauge,
  KeyRound,
  Landmark,
  Megaphone,
  MessageSquareText,
  Network,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Vote
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import municipalProfile from "@/config/municipal-profile.json";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navigation = [
  { label: "Dashboard", icon: Gauge, active: true },
  { label: "Plenos", icon: Vote },
  { label: "Mociones", icon: FileText },
  { label: "Expedientes", icon: FolderKanban },
  { label: "Decretos", icon: ReceiptText },
  { label: "Contratos", icon: BriefcaseBusiness },
  { label: "Presupuesto", icon: Euro },
  { label: "Campañas", icon: Megaphone },
  { label: "Comunicación", icon: MessageSquareText },
  { label: "Documentos", icon: Archive },
  { label: "Calendario", icon: CalendarDays },
  { label: "Configuración", icon: Settings }
];

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
  },
  {
    label: "Mociones vivas",
    value: "5",
    note: "Borrador, registro o defensa en pleno",
    icon: Landmark,
    tone: "neutral"
  },
  {
    label: "Tareas del equipo",
    value: "16",
    note: "Asignadas a concejales, asesores o comunicación",
    icon: CheckCircle2,
    tone: "neutral"
  }
];

const spokespersonPriorities = [
  {
    title: "Preparar posición para el próximo pleno",
    area: "Pleno",
    owner: "Portavoz",
    deadline: "48 h",
    status: "Prioridad alta"
  },
  {
    title: "Revisar decretos con impacto presupuestario",
    area: "Decretos",
    owner: "Hacienda",
    deadline: "Esta semana",
    status: "En revisión"
  },
  {
    title: "Cerrar argumentario de seguridad y limpieza",
    area: "Comunicación",
    owner: "Equipo comunicación",
    deadline: "Antes del viernes",
    status: "Pendiente"
  },
  {
    title: "Seleccionar expedientes para solicitud de información",
    area: "Fiscalización",
    owner: "Concejales",
    deadline: "7 días",
    status: "Planificado"
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
  },
  {
    date: "Mes",
    title: "Seguimiento presupuestario",
    detail: "Ejecución, modificaciones de crédito y compromisos de gasto"
  }
];

const oversightRows = [
  {
    subject: "Adjudicación de servicio municipal",
    source: "Junta de Gobierno Local",
    area: "Contratación",
    signal: "Importe relevante",
    status: "Revisar"
  },
  {
    subject: "Modificación de crédito",
    source: "Pleno",
    area: "Presupuesto",
    signal: "Afecta a prioridades políticas",
    status: "Analizar"
  },
  {
    subject: "Orden del día con asuntos urbanísticos",
    source: "Comisión informativa",
    area: "Urbanismo",
    signal: "Preparar preguntas",
    status: "Asignar"
  }
];

const documentFlow = [
  {
    title: "Entrada documental",
    value: "Subida manual",
    badge: "Activo"
  },
  {
    title: "Texto y metadatos",
    value: "OCR / parser",
    badge: "Siguiente"
  },
  {
    title: "Extracción política",
    value: "IA con revisión",
    badge: "Siguiente"
  },
  {
    title: "Tareas y alertas",
    value: "Asignación al equipo",
    badge: "Diseñado"
  }
];

const sources = [
  {
    title: "Supabase",
    meta: "Usuarios, roles, documentos y datos internos",
    status: "Conectado",
    icon: Database
  },
  {
    title: "Vercel",
    meta: "Aplicación desplegada y entorno de producción",
    status: "Activo",
    icon: ShieldCheck
  },
  {
    title: "n8n y fuentes públicas",
    meta: "Automatizaciones, BOCM, INE y portal municipal",
    status: "Pendiente",
    icon: Network
  }
];

export default async function DashboardPage() {
  await requireUser();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VOX</div>
          <div className="brand-title">Portal Grupo Municipal</div>
          <div className="brand-subtitle">
            {municipalProfile.groupName} · {municipalProfile.municipality.mandate}
          </div>
        </div>

        <nav className="nav-list" aria-label="Principal">
          {navigation.map((item) => (
            <a className="nav-item" data-active={item.active} href="#" key={item.label}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Dirección política interna</span>
          <span>Supabase · Vercel · automatización documental</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="page-title">
            <h1>Mesa del portavoz</h1>
            <span>
              {municipalProfile.municipality.name} · Mandato{" "}
              {municipalProfile.municipality.mandate}
            </span>
          </div>
          <div className="topbar-actions">
            <button className="button" type="button">
              <Search size={17} />
              Buscar
            </button>
            <button className="button" type="button">
              <Settings size={17} />
              Configurar
            </button>
            <button className="button primary" type="button">
              <FilePlus2 size={17} />
              Subir documento
            </button>
            <a className="button" href="/admin/users">
              <Users size={17} />
              Usuarios
            </a>
            <LogoutButton />
          </div>
        </header>

        <section className="content spokesperson-content">
          <section className="command-hero">
            <div className="command-hero-copy">
              <span className="eyebrow">
                <Target size={16} />
                Panel privado de dirección
              </span>
              <h2>Lo importante primero: pleno, fiscalización, alertas y equipo.</h2>
              <p>
                Esta pantalla debe servir como entrada diaria del portavoz: qué asuntos
                requieren decisión, qué documentación falta validar y qué hitos políticos
                llegan en los próximos días.
              </p>
            </div>
            <div className="command-hero-status">
              <span>Prioridad operativa</span>
              <strong>Preparar el próximo pleno y revisar expedientes sensibles</strong>
              <small>
                Base inicial con datos de ejemplo hasta conectar documentos, calendario y
                fuentes municipales reales.
              </small>
            </div>
          </section>

          <div className="metric-grid command-metric-grid">
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
          </div>

          <div className="spokesperson-grid">
            <section className="panel priority-panel">
              <div className="panel-header">
                <div>
                  <h2>Prioridades del portavoz</h2>
                  <p>Asuntos que deberían concentrar la atención política inmediata.</p>
                </div>
                <BellRing size={20} />
              </div>
              <div className="priority-list">
                {spokespersonPriorities.map((item) => (
                  <article className="priority-item" key={item.title}>
                    <div>
                      <span className="priority-area">{item.area}</span>
                      <h3>{item.title}</h3>
                      <p>{item.owner}</p>
                    </div>
                    <div className="priority-meta">
                      <strong>{item.deadline}</strong>
                      <span className="badge green">{item.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Próximos hitos</h2>
                  <p>Agenda política resumida para decidir y asignar trabajo.</p>
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
            </section>
          </div>

          <div className="dashboard-grid spokesperson-lower-grid">
            <section className="table-panel">
              <div className="table-header">
                <h2>Asuntos de fiscalización</h2>
                <span className="badge blue">Mesa de control</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Asunto</th>
                    <th>Fuente</th>
                    <th>Área</th>
                    <th>Señal</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {oversightRows.map((row) => (
                    <tr key={row.subject}>
                      <td>
                        <strong>{row.subject}</strong>
                      </td>
                      <td>{row.source}</td>
                      <td>{row.area}</td>
                      <td>{row.signal}</td>
                      <td>
                        <span className="badge gold">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Flujo documental</h2>
                  <p>De la entrada de documentos a tareas políticas medibles.</p>
                </div>
                <Bot size={20} />
              </div>
              <div className="status-list">
                {documentFlow.map((item) => (
                  <div className="status-item" key={item.title}>
                    <div>
                      <div className="status-title">{item.title}</div>
                      <div className="status-meta">{item.value}</div>
                    </div>
                    <span className="badge green">{item.badge}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="spokesperson-grid compact-grid">
            <section className="panel quick-actions-panel">
              <div className="panel-header">
                <div>
                  <h2>Acciones rápidas</h2>
                  <p>Entrada directa a tareas habituales del grupo municipal.</p>
                </div>
                <FilePlus2 size={20} />
              </div>
              <div className="quick-action-grid">
                <button className="button primary" type="button">Subir documento</button>
                <button className="button" type="button">Preparar pleno</button>
                <button className="button" type="button">Crear moción</button>
                <button className="button" type="button">Revisar alertas</button>
                <a className="button" href="/admin/users">Gestionar usuarios</a>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Sistema y fuentes</h2>
                  <p>Estado de la infraestructura y próximas conexiones.</p>
                </div>
                <KeyRound size={20} />
              </div>
              <div className="source-list">
                {sources.map((source) => (
                  <div className="source-item" key={source.title}>
                    <div>
                      <div className="source-title">{source.title}</div>
                      <div className="source-meta">{source.meta}</div>
                    </div>
                    <source.icon size={18} />
                    <span className="badge green">{source.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
