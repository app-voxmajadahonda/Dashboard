import {
  AlertTriangle,
  Archive,
  Bot,
  Building2,
  CalendarClock,
  CheckCircle2,
  Database,
  FilePlus2,
  FileText,
  Gauge,
  KeyRound,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";

const metrics = [
  {
    label: "Documentos pendientes",
    value: "12",
    note: "A la espera de clasificacion IA",
    icon: FileText
  },
  {
    label: "Acciones detectadas",
    value: "38",
    note: "Decretos, acuerdos y expedientes",
    icon: Gauge
  },
  {
    label: "Alertas abiertas",
    value: "7",
    note: "Importes, plazos o seguimiento politico",
    icon: AlertTriangle
  },
  {
    label: "Tareas activas",
    value: "16",
    note: "Asignadas al equipo municipal",
    icon: CheckCircle2
  }
];

const navigation = [
  { label: "Dashboard", icon: Gauge, active: true },
  { label: "Documentos", icon: Archive },
  { label: "Accion de gobierno", icon: Building2 },
  { label: "Mociones", icon: FileText },
  { label: "Comisiones", icon: Users },
  { label: "Automatizaciones", icon: Network },
  { label: "Configuracion", icon: Settings }
];

const actions = [
  {
    title: "Adjudicacion de servicio municipal",
    area: "Contratacion",
    source: "Junta de Gobierno Local",
    date: "Pendiente de validar",
    risk: "Importe relevante",
    status: "Revision"
  },
  {
    title: "Modificacion de credito",
    area: "Hacienda",
    source: "Pleno",
    date: "Pendiente de validar",
    risk: "Seguimiento presupuestario",
    status: "Analisis"
  },
  {
    title: "Orden del dia con asuntos urbanisticos",
    area: "Urbanismo",
    source: "Comision informativa",
    date: "Pendiente de validar",
    risk: "Preparar preguntas",
    status: "Tarea"
  }
];

const pipeline = [
  {
    title: "Subida documental",
    meta: "PDF, DOCX y enlaces a fuentes externas",
    badge: "MVP",
    color: "green"
  },
  {
    title: "Extraccion de texto",
    meta: "Parser/OCR con trazabilidad al documento",
    badge: "Siguiente",
    color: "blue"
  },
  {
    title: "Extraccion IA",
    meta: "Acuerdos, importes, organos, areas y tareas",
    badge: "Siguiente",
    color: "blue"
  },
  {
    title: "Revision humana",
    meta: "Validacion antes de consolidar datos",
    badge: "Clave",
    color: "gold"
  }
];

const sources = [
  {
    title: "Drive Vox Majadahonda",
    meta: "Fuente documental conectable con permisos limitados",
    status: "Pendiente"
  },
  {
    title: "Portal de transparencia municipal",
    meta: "Conector parametrizable por municipio",
    status: "Pendiente"
  },
  {
    title: "BOCM / BOE / INE",
    meta: "Fuentes publicas para alertas y contexto",
    status: "Fase 4"
  }
];

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GM</div>
          <div className="brand-title">Dashboard Grupo Municipal</div>
          <div className="brand-subtitle">Vox Majadahonda · MVP inicial</div>
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
          <span>Cloud-first</span>
          <span>GitHub + Supabase + Vercel + n8n</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="page-title">
            <h1>Panel de seguimiento</h1>
            <span>Fiscalizacion documental, mociones, comisiones y tareas</span>
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
          </div>
        </header>

        <section className="content">
          <div className="metric-grid">
            {metrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <header>
                  <span>{metric.label}</span>
                  <metric.icon size={18} />
                </header>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-note">{metric.note}</div>
              </article>
            ))}
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Pipeline documental</h2>
                  <p>Estado previsto del flujo de documentos del MVP.</p>
                </div>
                <Bot size={20} />
              </div>
              <div className="status-list">
                {pipeline.map((item) => (
                  <div className="status-item" key={item.title}>
                    <div>
                      <div className="status-title">{item.title}</div>
                      <div className="status-meta">{item.meta}</div>
                    </div>
                    <span className={`badge ${item.color}`}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Gobierno y seguridad</h2>
                  <p>Base para credenciales, roles y fuentes.</p>
                </div>
                <ShieldCheck size={20} />
              </div>
              <div className="source-list">
                <div className="source-item">
                  <div>
                    <div className="source-title">Roles</div>
                    <div className="source-meta">Administrador, concejal e integracion API</div>
                  </div>
                  <KeyRound size={18} />
                </div>
                <div className="source-item">
                  <div>
                    <div className="source-title">Base de datos</div>
                    <div className="source-meta">Supabase PostgreSQL con RLS</div>
                  </div>
                  <Database size={18} />
                </div>
                <div className="source-item">
                  <div>
                    <div className="source-title">Calendario politico</div>
                    <div className="source-meta">Plenos, comisiones y vencimientos</div>
                  </div>
                  <CalendarClock size={18} />
                </div>
              </div>
            </section>
          </div>

          <section className="table-panel">
            <div className="table-header">
              <h2>Acciones de gobierno detectadas</h2>
              <span className="badge blue">Datos de ejemplo</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Area</th>
                  <th>Fuente</th>
                  <th>Riesgo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.title}>
                    <td>
                      <strong>{action.title}</strong>
                      <div className="muted">{action.date}</div>
                    </td>
                    <td>{action.area}</td>
                    <td>{action.source}</td>
                    <td>{action.risk}</td>
                    <td>
                      <span className="badge gold">{action.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Fuentes pendientes de conexion</h2>
                <p>Se activaran por configuracion, no con codigo fijo de Majadahonda.</p>
              </div>
              <Network size={20} />
            </div>
            <div className="source-list">
              {sources.map((source) => (
                <div className="source-item" key={source.title}>
                  <div>
                    <div className="source-title">{source.title}</div>
                    <div className="source-meta">{source.meta}</div>
                  </div>
                  <span className="badge red">{source.status}</span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
