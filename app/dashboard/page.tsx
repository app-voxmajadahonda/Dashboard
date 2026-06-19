import {
  AlertTriangle,
  Archive,
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
  Megaphone,
  MessageSquareText,
  Network,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Vote
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import municipalProfile from "@/config/municipal-profile.json";
import { requireUser } from "@/lib/supabase/server";

const metrics = [
  {
    label: "Documentos pendientes",
    value: "12",
    note: "A la espera de clasificación IA",
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
    note: "Importes, plazos o seguimiento político",
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

const actions = [
  {
    title: "Adjudicacion de servicio municipal",
    area: "Contratacion",
    source: "Junta de Gobierno Local",
    date: "Pendiente de validar",
    risk: "Importe relevante",
    status: "Revisión"
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
    title: "Extracción de texto",
    meta: "Parser/OCR con trazabilidad al documento",
    badge: "Siguiente",
    color: "blue"
  },
  {
    title: "Extracción IA",
    meta: "Acuerdos, importes, órganos, áreas y tareas",
    badge: "Siguiente",
    color: "blue"
  },
  {
    title: "Revisión humana",
    meta: "Validación antes de consolidar datos",
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
    meta: "Fuentes públicas para alertas y contexto",
    status: "Fase 4"
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
          <span>Cloud-first</span>
          <span>GitHub + Supabase + Vercel + n8n</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="page-title">
            <h1>Panel de seguimiento</h1>
            <span>Control político, fiscalización documental y coordinación interna</span>
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
                    <div className="source-title">Calendario político</div>
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
                <h2>Fuentes pendientes de conexión</h2>
                <p>Se activarán por configuración, no con código fijo del municipio.</p>
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
