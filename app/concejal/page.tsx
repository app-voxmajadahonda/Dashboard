import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  FolderKanban,
  Landmark,
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
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getCouncillorDashboardData } from "@/lib/data/councillor-dashboard";
import { getSituationRoomData } from "@/lib/data/operational";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short"
  }).format(new Date(value));
}

function emptyRows(message: string, columns: number) {
  return [[message, ...Array.from({ length: columns - 1 }, () => "")]];
}

export default async function CouncillorPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);
  const [dashboard, situation] = await Promise.all([
    getCouncillorDashboardData(context),
    context
      ? getSituationRoomData(context.organization.id, user.id)
      : Promise.resolve({
          alerts: [],
          assignedTasks: [],
          upcomingEvents: [],
          nextPlenary: null,
          upcomingCommittees: [],
          pendingMotions: [],
          institutionalRequests: [],
          overdueRequests: [],
          votes: []
        })
  ]);

  const strategicIndicators =
    dashboard.sourceMode === "database"
      ? [...dashboard.generalKpis, ...dashboard.budgetKpis].filter((kpi) =>
          [
            "PoblaciÃ³n total",
            "Presupuesto por habitante",
            "Presupuesto total",
            "Gasto corriente / hab.",
            "Deuda por habitante",
            "Ordenanzas cargadas"
          ].includes(kpi.label)
        )
      : [];

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <main className="private-main councillor-workspace">
        <div className="councillor-control-layout">
          <section className="councillor-content-frame" aria-label="Contenido operativo del concejal">
            <details className="workspace-accordion" id="sala-situacion" open>
              <summary>
                <span>
                  <Bell size={18} />
                  Sala de Situacion
                </span>
                <small>Que esta pasando ahora y que hay que hacer antes del proximo pleno</small>
              </summary>
              <div className="accordion-content">
                <div className="section-title-row">
                  <div>
                    <span className="eyebrow">Sala de Situacion</span>
                    <h2>Prioridades operativas del grupo municipal</h2>
                  </div>
                  <FilterBar filters={["Hoy", "7 dias", "30 dias", "Pendiente"]} />
                </div>

                <div className="dashboard-two-columns">
                  <EntityDetailView
                    details={[
                      {
                        label: "Proximo pleno",
                        value: situation.nextPlenary
                          ? `${situation.nextPlenary.title} · ${formatDateTime(situation.nextPlenary.session_date)} · ${situation.nextPlenary.status}`
                          : "No hay pleno registrado en la base operativa."
                      },
                      {
                        label: "Proximas comisiones",
                        value: situation.upcomingCommittees.length
                          ? situation.upcomingCommittees
                              .map((session) => `${session.title} (${formatDate(session.session_date)})`)
                              .join(" | ")
                          : "No hay comisiones proximas registradas."
                      },
                      {
                        label: "Solicitudes vencidas",
                        value: situation.overdueRequests.length
                          ? `${situation.overdueRequests.length} solicitudes requieren revision.`
                          : "No hay solicitudes vencidas registradas."
                      }
                    ]}
                    title="Estado institucional inmediato"
                  />
                  <DataTable
                    columns={["Indicador", "Valor", "Estado", "Fuente"]}
                    rows={
                      strategicIndicators.length
                        ? strategicIndicators.map((kpi) => [
                            kpi.label,
                            kpi.value,
                            kpi.source.status,
                            kpi.source.label
                          ])
                        : emptyRows("No hay indicadores estrategicos reales cargados todavia.", 4)
                    }
                    subtitle="Solo se muestran indicadores reales cargados en Supabase."
                    title="Indicadores estrategicos"
                  />
                </div>

                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Alerta", "Prioridad", "Vencimiento", "Accion"]}
                    rows={
                      situation.alerts.length
                        ? situation.alerts.slice(0, 6).map((alert) => [
                            alert.title,
                            alert.priority,
                            formatDateTime(alert.due_at),
                            alert.recommended_action ?? "Revisar"
                          ])
                        : emptyRows("No hay alertas abiertas.", 4)
                    }
                    title="Alertas abiertas"
                  />
                  <DataTable
                    columns={["Tarea", "Prioridad", "Vencimiento", "Estado"]}
                    rows={
                      situation.assignedTasks.length
                        ? situation.assignedTasks.slice(0, 6).map((task) => [
                            task.title,
                            task.priority,
                            formatDateTime(task.due_at),
                            task.status
                          ])
                        : emptyRows("No tienes tareas pendientes asignadas.", 4)
                    }
                    title="Mis tareas pendientes"
                  />
                </div>

                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Solicitud", "Tipo", "Plazo", "Estado"]}
                    rows={
                      situation.institutionalRequests.length
                        ? situation.institutionalRequests.slice(0, 8).map((request) => [
                            request.title,
                            request.request_type,
                            formatDateTime(request.due_at),
                            request.status
                          ])
                        : emptyRows("No hay preguntas, ruegos o solicitudes registradas.", 4)
                    }
                    title="Solicitudes y preguntas"
                  />
                  <DataTable
                    columns={["Mocion", "Eje", "Estado", "Seguimiento"]}
                    rows={
                      situation.pendingMotions.length
                        ? situation.pendingMotions.slice(0, 8).map((motion) => [
                            motion.title,
                            motion.strategic_axis ?? "Sin eje",
                            motion.status,
                            motion.follow_up_status ?? "Sin seguimiento"
                          ])
                        : emptyRows("No hay mociones en preparacion o seguimiento.", 4)
                    }
                    title="Mociones en preparacion o seguimiento"
                  />
                </div>
                <div className="dashboard-two-columns">
                  <DataTable
                    columns={["Pleno", "Fecha", "Tipo", "Estado"]}
                    rows={
                      situation.nextPlenary
                        ? [[
                            situation.nextPlenary.title,
                            formatDateTime(situation.nextPlenary.session_date),
                            situation.nextPlenary.session_type,
                            situation.nextPlenary.status
                          ]]
                        : emptyRows("No hay plenos registrados.", 4)
                    }
                    title="Plenos"
                  />
                  <DataTable
                    columns={["Asunto", "Tipo", "VOX", "PP", "PSOE", "Resultado"]}
                    rows={
                      situation.votes.length
                        ? situation.votes.map((vote) => [
                            vote.item_title,
                            vote.item_type,
                            vote.vox_vote ?? "-",
                            vote.pp_vote ?? "-",
                            vote.psoe_vote ?? "-",
                            vote.result ?? "Pendiente"
                          ])
                        : emptyRows("No hay votaciones registradas.", 6)
                    }
                    title="Votaciones"
                  />
                </div>
              </div>
            </details>

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
                    rows={
                      situation.pendingMotions.length
                        ? situation.pendingMotions.map((motion) => [
                            motion.title,
                            formatDate(motion.registered_at),
                            motion.strategic_axis ?? "Sin eje",
                            motion.responsible_councillor_id ?? "Sin asignar",
                            motion.status
                          ])
                        : emptyRows("No hay mociones registradas.", 5)
                    }
                    source={dashboard.sources.internal}
                    subtitle="Listado filtrable por año, eje, estado, concejal y resultado."
                    title="Mociones"
                  />
                  <DataTable
                    columns={["Iniciativa", "Área", "Plazo", "Estado"]}
                    rows={
                      situation.institutionalRequests.length
                        ? situation.institutionalRequests.map((request) => [
                            request.title,
                            request.area ?? "Sin area",
                            formatDate(request.due_at),
                            request.status
                          ])
                        : emptyRows("No hay preguntas, ruegos o solicitudes registradas.", 4)
                    }
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
                {situation.alerts.length ? (
                  situation.alerts.slice(0, 5).map((alert) => (
                  <details className="rail-disclosure" key={alert.id}>
                    <summary>
                      <strong>{alert.title}</strong>
                      <span>{alert.priority}</span>
                    </summary>
                    <dl>
                      <div>
                        <dt>Origen</dt>
                        <dd>{alert.source ?? alert.category}</dd>
                      </div>
                      <div>
                        <dt>Fecha límite</dt>
                        <dd>{formatDateTime(alert.due_at)}</dd>
                      </div>
                      <div>
                        <dt>Detalle</dt>
                        <dd>{alert.description ?? "Sin descripcion."}</dd>
                      </div>
                      <div>
                        <dt>Accion</dt>
                        <dd>{alert.recommended_action ?? "Revisar con el portavoz."}</dd>
                      </div>
                    </dl>
                  </details>
                  ))
                ) : (
                  <div className="empty-state">No hay alertas abiertas.</div>
                )}
              </div>
            </section>

            <section className="rail-panel">
              <header>
                <CheckCircle2 size={18} />
                <h2>Tareas pendientes</h2>
              </header>
              <div className="rail-stack">
                {situation.assignedTasks.length ? (
                  situation.assignedTasks.slice(0, 5).map((task) => (
                  <details className="rail-disclosure" key={task.id}>
                    <summary>
                      <strong>{task.title}</strong>
                      <span>{formatDate(task.due_at)}</span>
                    </summary>
                    <dl>
                      <div>
                        <dt>Prioridad</dt>
                        <dd>{task.priority}</dd>
                      </div>
                      <div>
                        <dt>Estado</dt>
                        <dd>{task.status}</dd>
                      </div>
                      <div>
                        <dt>Descripción</dt>
                        <dd>{task.description ?? "Sin descripcion."}</dd>
                      </div>
                    </dl>
                  </details>
                  ))
                ) : (
                  <div className="empty-state">No tienes tareas asignadas.</div>
                )}
              </div>
            </section>

            <section className="rail-panel">
              <header>
                <CalendarDays size={18} />
                <h2>Calendario</h2>
              </header>
              <details className="calendar-disclosure" open>
                <summary>Proximos 30 dias</summary>
                <div className="rail-stack">
                  {situation.upcomingEvents.length ? (
                    situation.upcomingEvents.slice(0, 8).map((event) => (
                      <a className="rail-event-link" href="#control-institucional" key={event.id}>
                        <strong>{event.title}</strong>
                        <span>{formatDateTime(event.starts_at)}</span>
                        <small>{event.event_type} · {event.status}</small>
                      </a>
                    ))
                  ) : (
                    <div className="empty-state">No hay eventos registrados.</div>
                  )}
                </div>
              </details>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
