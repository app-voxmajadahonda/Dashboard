import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Landmark,
  MessageSquarePlus,
  ScrollText,
  Star,
  Users
} from "lucide-react";
import {
  ChartCard,
  ComparisonTable,
  DataTable,
  DocumentCard,
  EntityDetailView,
  FilterBar,
  KPICard
} from "@/components/dashboard/dashboard-components";
import { CouncillorObservationForm } from "@/components/dashboard/councillor-observation-form";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import municipalProfile from "@/config/municipal-profile.json";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getCouncillorDashboardData } from "@/lib/data/councillor-dashboard";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const sideAlerts = [
  {
    title: "Datos caducados",
    origin: "Indicadores municipales",
    importance: "Alta",
    deadline: "Revisión pendiente",
    detail: "Los indicadores que superen su fecha de caducidad deben revisarse antes de usarse como dato oficial."
  },
  {
    title: "ROM pendiente",
    origin: "Documentación base",
    importance: "Media",
    deadline: "Antes de calendario definitivo",
    detail: "Sin ROM validado, los plazos de mociones, preguntas y comisiones quedan como estimación interna."
  }
];

const sideTasks = [
  {
    title: "Revisar documentación pendiente",
    startsAt: "Sin fecha",
    endsAt: "Esta semana",
    detail: "Comprobar qué documentos base siguen sin cargarse para completar la configuración del municipio."
  },
  {
    title: "Preparar observaciones para pleno",
    startsAt: "Pendiente",
    endsAt: "Pendiente",
    detail: "Recoger asuntos relevantes detectados por el concejal y convertirlos en preguntas, ruegos o tareas."
  },
  {
    title: "Validar fuentes de datos",
    startsAt: "Pendiente",
    endsAt: "Sin fecha",
    detail: "Revisar qué datos salen de API oficial y cuáles requieren carga manual por el portavoz."
  }
];

const calendarDays = [
  { day: "1" },
  { day: "2" },
  { day: "3", label: "Comisión" },
  { day: "4" },
  { day: "5" },
  { day: "6" },
  { day: "7" },
  { day: "8" },
  { day: "9" },
  { day: "10", label: "Pleno" },
  { day: "11" },
  { day: "12" },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18", label: "Plazo" },
  { day: "19" },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  { day: "24" },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" }
];

export default async function CouncillorPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);
  const dashboard = await getCouncillorDashboardData(context);

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <main className="private-main councillor-workspace">
        <header className="private-page-header">
          <div>
            <span className="eyebrow">
              <Users size={16} />
              Ficha de concejal
            </span>
            <h1>Ficha de concejal</h1>
            <p>
              Vista de consulta y seguimiento para concejales de {municipalProfile.groupName}.
              El área central muestra cada bloque operativo y la barra derecha mantiene alertas,
              tareas y calendario siempre visibles.
            </p>
          </div>
          <div className="private-header-actions">
            <button className="button" type="button">
              <Download size={17} />
              Exportar
            </button>
            <a className="button primary" href="#observaciones">
              <MessageSquarePlus size={17} />
              Añadir observación
            </a>
          </div>
        </header>

        <div className="councillor-control-layout">
          <section className="councillor-content-frame" aria-label="Contenido operativo del concejal">
            <details className="workspace-accordion" id="datos-generales" open>
              <summary>
                <span>
                  <Users size={18} />
                  Datos generales
                </span>
                <small>Municipio, demografía, servicios y ficha política</small>
              </summary>
              <div className="accordion-content">
                <div className="section-title-row">
                  <div>
                    <span className="eyebrow">Datos generales</span>
                    <h2>Municipio, demografía, servicios y ficha política</h2>
                  </div>
                  <FilterBar filters={["Resumen", "Demografía", "Socioeconomía", "Servicios", "Ficha política"]} />
                </div>

                <div className="dashboard-kpi-grid">
                  {dashboard.generalKpis.map((kpi) => (
                    <KPICard key={kpi.label} {...kpi} />
                  ))}
                </div>

                <div className="dashboard-two-columns">
                  <ChartCard
                    data={dashboard.demographicEvolution}
                    source={dashboard.sources.ine}
                    subtitle="Debe alimentarse desde INE, Comunidad de Madrid o carga validada."
                    title="Evolución de población"
                  />
                  <ChartCard
                    data={dashboard.ageStructure}
                    source={dashboard.sources.madridStats}
                    subtitle="Tramos de edad para seguimiento demográfico."
                    title="Población por edad"
                  />
                </div>

                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Servicio", "Dato", "Fuente", "Estado"]}
                    rows={dashboard.serviceRows}
                    source={dashboard.sources.internal}
                    subtitle="Equipamientos y servicios con carga manual inicial."
                    title="Servicios e infraestructuras"
                  />
                  <DataTable
                    columns={["Campo", "Valor", "Detalle", "Estado"]}
                    rows={dashboard.politicalProfile}
                    source={dashboard.sources.internal}
                    subtitle="Datos políticos básicos del municipio."
                    title="Ficha política municipal"
                  />
                </div>
              </div>
            </details>

            <details className="workspace-accordion" id="fiscalidad-presupuesto">
              <summary>
                <span>
                  <FileText size={18} />
                  Fiscalidad y presupuesto
                </span>
                <small>Presupuesto, ordenanzas y comparativa fiscal</small>
              </summary>
              <div className="accordion-content">
                <div className="section-title-row">
                  <div>
                    <span className="eyebrow">Fiscalidad y presupuesto</span>
                    <h2>Presupuesto, ordenanzas y comparativa fiscal</h2>
                  </div>
                  <FilterBar filters={["Resumen", "Presupuesto", "Ordenanzas", "Haciendas Locales", "Comparativa"]} />
                </div>

                <div className="dashboard-kpi-grid">
                  {dashboard.budgetKpis.map((kpi) => (
                    <KPICard key={kpi.label} {...kpi} />
                  ))}
                </div>

                <div className="dashboard-two-columns">
                  <ChartCard
                    data={dashboard.budgetEvolution}
                    source={dashboard.sources.internal}
                    subtitle="Evolución anual 2023-2027 cuando se carguen presupuestos."
                    title="Evolución presupuestaria"
                  />
                  <DataTable
                    columns={["Ordenanza", "Tipo actual", "Mínimo legal", "Máximo legal", "Acción"]}
                    rows={dashboard.fiscalOrdinances}
                    source={dashboard.sources.internal}
                    subtitle="Base de ordenanzas fiscales preparada para extracción documental."
                    title="Fiscalidad municipal"
                  />
                </div>

                <div className="dashboard-two-columns">
                  <EntityDetailView
                    details={[
                      { label: "IBI", value: "Tipo actual, mínimo, máximo, bonificaciones y propuesta VOX." },
                      { label: "IVTM", value: "Coeficientes, bonificaciones posibles y margen de reducción." },
                      { label: "ICIO", value: "Tipo actual, máximo legal y bonificaciones potestativas." },
                      { label: "Plusvalía", value: "Coeficientes, bonificaciones y margen de mejora." },
                      { label: "Tasa de basuras", value: "Cuota, sujetos pasivos, bonificaciones y análisis político." }
                    ]}
                    title="Comparativa con Haciendas Locales"
                  />
                  <ComparisonTable rows={dashboard.comparisonRows} title="Comparativa con municipios cercanos" />
                </div>
              </div>
            </details>

            <details className="workspace-accordion" id="contratos">
              <summary>
                <span>
                  <BriefcaseBusiness size={18} />
                  Seguimiento de contratos
                </span>
                <small>Contratación, adjudicaciones, prórrogas y alertas</small>
              </summary>
              <div className="accordion-content">
                <DataTable
                  columns={["Contrato", "Área", "Importe", "Estado", "Fuente"]}
                  rows={[
                    ["Contratos relevantes", "Pendiente", "Pendiente", "Catálogo por definir", "Portal contratación / carga documental"],
                    ["Prórrogas", "Pendiente", "Pendiente", "Catálogo por definir", "Ayuntamiento / expediente"],
                    ["Contratos menores", "Pendiente", "Pendiente", "Catálogo por definir", "Portal transparencia"]
                  ]}
                  source={dashboard.sources.officialPending}
                  subtitle="Pendiente de conectar a portal de contratación, transparencia o cargas del portavoz."
                  title="Seguimiento inicial de contratación"
                />
              </div>
            </details>

            <details className="workspace-accordion" id="proyectos">
              <summary>
                <span>
                  <FolderKanban size={18} />
                  Seguimiento de proyectos especiales
                </span>
                <small>Proyectos municipales, expedientes e hitos</small>
              </summary>
              <div className="accordion-content">
                <DataTable
                  columns={["Proyecto", "Área", "Hito actual", "Responsable", "Estado"]}
                  rows={[
                    ["Proyectos municipales prioritarios", "Pendiente", "Definir catálogo", "Portavoz/admin", "Pendiente"],
                    ["Expedientes con seguimiento político", "Pendiente", "Vincular expedientes", "Equipo", "Pendiente"],
                    ["Compromisos del programa electoral", "Pendiente", "Cruzar con iniciativas", "Equipo", "Pendiente"]
                  ]}
                  source={dashboard.sources.internal}
                  subtitle="Estructura reservada para proyectos, expedientes e hitos de seguimiento."
                  title="Mapa de proyectos"
                />
              </div>
            </details>

            <details className="workspace-accordion" id="analisis-electoral">
              <summary>
                <span>
                  <BarChart3 size={18} />
                  Análisis electoral
                </span>
                <small>Resultados, evolución de VOX y comparativas</small>
              </summary>
              <div className="accordion-content">
                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Dato", "Valor", "Fuente", "Estado"]}
                    rows={[
                      ["Resultados 2019", "Pendiente", "Ministerio / Junta Electoral", "Pendiente"],
                      ["Resultados 2023", "Pendiente", "Ministerio / Junta Electoral", "Pendiente"],
                      ["Evolución VOX", "Pendiente", "Cálculo interno validado", "Pendiente"],
                      ["Barrios/secciones", "Pendiente", "Fuente electoral", "Pendiente"]
                    ]}
                    source={dashboard.sources.officialPending}
                    title="Base de análisis electoral"
                  />
                  <DataTable
                    columns={["Grupo", "A favor", "En contra", "Abstención", "Observación"]}
                    rows={dashboard.votePatterns.slice(1)}
                    source={dashboard.sources.internal}
                    subtitle="Base preparada para detectar patrones políticos de votación."
                    title="Patrones de votación"
                  />
                </div>
              </div>
            </details>

            <details className="workspace-accordion" id="promesas-electorales">
              <summary>
                <span>
                  <ScrollText size={18} />
                  Promesas electorales
                </span>
                <small>Programa electoral, compromisos e iniciativas asociadas</small>
              </summary>
              <div className="accordion-content">
                <DataTable
                  columns={["Compromiso", "Área", "Iniciativa asociada", "Estado", "Alerta"]}
                  rows={[
                    ["Programa electoral completo", "Pendiente", "Pendiente de extracción", "Pendiente", "Cargar programa"],
                    ["Medidas sin iniciativa", "Pendiente", "Sin vincular", "Pendiente", "Generar alerta"],
                    ["Medidas con seguimiento", "Pendiente", "Sin datos", "Pendiente", "Validar fuente"]
                  ]}
                  source={dashboard.sources.internal}
                  subtitle="La app debe cruzar el programa electoral con mociones, preguntas e iniciativas."
                  title="Seguimiento de promesas electorales"
                />
              </div>
            </details>

            <details className="workspace-accordion" id="control-institucional">
              <summary>
                <span>
                  <Landmark size={18} />
                  Control institucional
                </span>
                <small>Plenos, comisiones, preguntas, ruegos y votaciones</small>
              </summary>
              <div className="accordion-content">
                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Título", "Fecha", "Eje", "Responsable", "Estado"]}
                    rows={dashboard.motions}
                    source={dashboard.sources.internal}
                    subtitle="Listado filtrable por año, eje, estado, concejal y resultado."
                    title="Mociones"
                  />
                  <DataTable
                    columns={["Iniciativa", "Área", "Plazo", "Estado"]}
                    rows={dashboard.questions}
                    source={dashboard.sources.internal}
                    subtitle="Preguntas, ruegos, solicitudes y vencimientos."
                    title="Preguntas, ruegos y solicitudes"
                  />
                </div>
              </div>
            </details>

            <details className="workspace-accordion" id="documentos">
              <summary>
                <span>
                  <FileText size={18} />
                  Documentos y fuentes
                </span>
                <small>Documentación disponible para concejales</small>
              </summary>
              <div className="accordion-content">
                <div className="document-grid">
                  {dashboard.documentCards.map((document) => (
                    <DocumentCard key={`${document.type}-${document.title}`} {...document} />
                  ))}
                </div>
              </div>
            </details>

            <details className="workspace-accordion" id="observaciones">
              <summary>
                <span>
                  <Star size={18} />
                  Observaciones del concejal
                </span>
                <small>Anotaciones internas y acciones permitidas</small>
              </summary>
              <div className="accordion-content">
                <div className="permission-grid">
                  {[
                    ["Ver información", "Disponible"],
                    ["Filtrar datos", "Disponible"],
                    ["Exportar", "Preparado"],
                    ["Añadir observaciones propias", "Preparado"],
                    ["Marcar asuntos relevantes", "Preparado"],
                    ["Modificar fuentes oficiales", "No permitido"],
                    ["Aprobar datos importados", "No permitido"]
                  ].map(([label, state]) => (
                    <article key={label}>
                      <Eye size={17} />
                      <strong>{label}</strong>
                      <span>{state}</span>
                    </article>
                  ))}
                </div>
                <CouncillorObservationForm />
              </div>
            </details>
          </section>

          <aside className="right-control-rail" aria-label="Alertas, tareas y calendario">
            <section className="rail-panel">
              <header>
                <Bell size={18} />
                <h2>Alertas pendientes</h2>
              </header>
              <div className="rail-stack">
                {sideAlerts.map((alert) => (
                  <details className="rail-disclosure" key={alert.title}>
                    <summary>
                      <strong>{alert.title}</strong>
                      <span>{alert.importance}</span>
                    </summary>
                    <dl>
                      <div>
                        <dt>Origen</dt>
                        <dd>{alert.origin}</dd>
                      </div>
                      <div>
                        <dt>Fecha límite</dt>
                        <dd>{alert.deadline}</dd>
                      </div>
                      <div>
                        <dt>Detalle</dt>
                        <dd>{alert.detail}</dd>
                      </div>
                    </dl>
                  </details>
                ))}
              </div>
            </section>

            <section className="rail-panel">
              <header>
                <CheckCircle2 size={18} />
                <h2>Tareas pendientes</h2>
              </header>
              <div className="rail-stack">
                {sideTasks.map((task) => (
                  <details className="rail-disclosure" key={task.title}>
                    <summary>
                      <strong>{task.title}</strong>
                      <span>{task.endsAt}</span>
                    </summary>
                    <dl>
                      <div>
                        <dt>Inicio</dt>
                        <dd>{task.startsAt}</dd>
                      </div>
                      <div>
                        <dt>Fin</dt>
                        <dd>{task.endsAt}</dd>
                      </div>
                      <div>
                        <dt>Descripción</dt>
                        <dd>{task.detail}</dd>
                      </div>
                    </dl>
                  </details>
                ))}
              </div>
            </section>

            <section className="rail-panel">
              <header>
                <CalendarDays size={18} />
                <h2>Calendario</h2>
              </header>
              <details className="calendar-disclosure" open>
                <summary>Junio 2026</summary>
                <div className="mini-calendar">
                  {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                    <strong key={day}>{day}</strong>
                  ))}
                  {calendarDays.map((day) => (
                    <a className={day.label ? "has-event" : undefined} href="#control-institucional" key={day.day}>
                      <span>{day.day}</span>
                      {day.label ? <small>{day.label}</small> : null}
                    </a>
                  ))}
                </div>
                <p>
                  Al seleccionar una fecha se abrirá el calendario ampliado cuando construyamos la
                  pantalla específica de calendario.
                </p>
              </details>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
