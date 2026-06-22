import {
  AlertTriangle,
  Download,
  Eye,
  FileText,
  MessageSquarePlus,
  Star,
  Users,
  Vote
} from "lucide-react";
import {
  AlertCard,
  CalendarView,
  ChartCard,
  ComparisonTable,
  DataTable,
  DocumentCard,
  EntityDetailView,
  FilterBar,
  KPICard,
  SourceBadge
} from "@/components/dashboard/dashboard-components";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import municipalProfile from "@/config/municipal-profile.json";
import {
  ageStructure,
  budgetEvolution,
  budgetKpis,
  comparisonRows,
  crimeEvolution,
  demographicEvolution,
  fiscalOrdinances,
  generalKpis,
  institutionalEvents,
  motions,
  politicalProfile,
  questions,
  securityIssues,
  securityKpis,
  serviceRows,
  sidebarSections,
  sources,
  votePatterns
} from "@/lib/mock/councillor-dashboard";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const mainTabs = [
  "Información general del municipio",
  "Institucional",
  "Seguridad",
  "Presupuesto y fiscalidad"
];

export default async function CouncillorPage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);
  const roleLabel = context?.membership.role === "admin" ? "Vista ampliada portavoz/admin" : "Rol concejal";

  return (
    <div className="private-shell">
      <PrivateTopNav />

      <div className="councillor-dashboard-shell">
        <aside className="councillor-sidebar">
          <div>
            <span className="brand-mark">VOX</span>
            <strong>Dashboard concejal</strong>
            <small>{municipalProfile.municipality.name}</small>
          </div>
          <nav aria-label="Secciones del dashboard de concejal">
            {sidebarSections.map((section) => (
              <a href={section.href} key={section.href}>
                <section.icon size={17} />
                <span>{section.label}</span>
              </a>
            ))}
          </nav>
          <footer>
            <span>{roleLabel}</span>
            <span>Datos visibles también para el portavoz.</span>
          </footer>
        </aside>

        <main className="councillor-dashboard-main">
          <header className="private-page-header">
            <div>
              <span className="eyebrow">
                <Users size={16} />
                Dashboard interno · Concejal
              </span>
              <h1>Panel de concejal</h1>
              <p>
                Consulta operativa de municipio, institución, seguridad, presupuesto y fiscalidad.
                Esta versión usa datos iniciales simulados y queda preparada para conectar fuentes
                oficiales, cargas manuales y validación posterior del portavoz.
              </p>
            </div>
            <div className="private-header-actions">
              <button className="button" type="button">
                <Download size={17} />
                Exportar
              </button>
              <button className="button primary" type="button">
                <MessageSquarePlus size={17} />
                Añadir observación
              </button>
            </div>
          </header>

          <nav className="dashboard-tabs" aria-label="Pestañas principales del dashboard">
            {mainTabs.map((tab, index) => (
              <a data-active={index === 0} href={`#${index === 0 ? "informacion-general" : tab.toLowerCase().replace(/\s+/g, "-")}`} key={tab}>
                {tab}
              </a>
            ))}
          </nav>

          <section className="councillor-section" id="informacion-general">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <Users size={16} />
                  Información general del municipio
                </span>
                <h2>Majadahonda: visión global</h2>
              </div>
              <FilterBar filters={["Resumen", "Demografía", "Socioeconomía", "Fiscal agregado", "Servicios"]} />
            </div>

            <div className="dashboard-kpi-grid">
              {generalKpis.map((kpi) => (
                <KPICard key={kpi.label} {...kpi} />
              ))}
            </div>

            <div className="dashboard-two-columns">
              <ChartCard
                data={demographicEvolution}
                source={sources.ine}
                subtitle="Estructura preparada para serie INE por años."
                title="Evolución de población"
              />
              <ChartCard
                data={ageStructure}
                source={sources.madridStats}
                subtitle="Tramos de edad para seguimiento demográfico."
                title="Población por edad"
              />
            </div>

            <div className="dashboard-two-columns">
              <DataTable
                columns={["Indicador", "Valor", "Fuente", "Estado"]}
                rows={[
                  ["Edad media", "Pendiente", "INE / Comunidad de Madrid", "Pendiente validación"],
                  ["Índice de envejecimiento", "Pendiente", "INE", "Pendiente validación"],
                  ["Número de hogares", "Pendiente", "INE", "Pendiente validación"],
                  ["Población extranjera", "Pendiente", "INE", "Pendiente validación"],
                  ["Altas y bajas padronales", "Pendiente", "Ayuntamiento", "Manual si no hay API"]
                ]}
                source={sources.ine}
                subtitle="Datos demográficos esenciales."
                title="Demografía detallada"
              />
              <DataTable
                columns={["Indicador", "Valor", "Fuente", "Estado"]}
                rows={[
                  ["Renta media por persona", "Pendiente", "INE / AEAT", "Pendiente"],
                  ["Tasa de paro", "Pendiente", "SEPE / Comunidad de Madrid", "Pendiente"],
                  ["Afiliación Seguridad Social", "Pendiente", "Fuente oficial", "Pendiente"],
                  ["Precio medio vivienda", "Pendiente", "Carga manual / fuente externa", "Estimado"],
                  ["Empresas y comercios", "Pendiente", "Ayuntamiento / CAM", "Pendiente"]
                ]}
                source={sources.officialPending}
                subtitle="Renta, empleo y actividad económica."
                title="Datos socioeconómicos"
              />
            </div>

            <div className="dashboard-two-columns">
              <DataTable
                columns={["Servicio", "Dato", "Fuente", "Estado"]}
                rows={serviceRows}
                source={sources.internal}
                subtitle="Equipamientos y servicios con carga manual inicial."
                title="Servicios e infraestructuras"
              />
              <DataTable
                columns={["Campo", "Valor", "Detalle", "Estado"]}
                rows={politicalProfile}
                source={sources.internal}
                subtitle="Datos políticos básicos del municipio."
                title="Ficha política municipal"
              />
            </div>
          </section>

          <section className="councillor-section" id="institucional">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <Vote size={16} />
                  Institucional
                </span>
                <h2>Plenos, comisiones, mociones e iniciativas</h2>
              </div>
              <FilterBar filters={["Todos", "Plenos", "Comisiones", "Mociones", "Preguntas", "Votaciones"]} />
            </div>

            <div className="dashboard-two-columns">
              <article className="dashboard-card">
                <header className="dashboard-card-header">
                  <div>
                    <h2>Calendario institucional</h2>
                    <p>Plenos, comisiones, juntas y vencimientos.</p>
                  </div>
                </header>
                <CalendarView events={institutionalEvents} />
                <SourceBadge source={sources.internal} />
              </article>

              <div className="alert-stack">
                <AlertCard
                  detail="Configurar fecha límite de mociones y preguntas cuando se cargue el ROM."
                  priority="alta"
                  source={sources.internal}
                  title="Pendiente régimen de plazos"
                />
                <AlertCard
                  detail="Las fichas individuales por pleno quedarán conectadas a órdenes del día, actas y votaciones."
                  priority="media"
                  source={sources.internal}
                  title="Ficha de pleno preparada"
                />
              </div>
            </div>

            <div className="dashboard-two-columns">
              <DataTable
                columns={["Título", "Fecha", "Eje", "Responsable", "Estado"]}
                rows={motions}
                source={sources.internal}
                subtitle="Listado filtrable por año, eje, estado, concejal y resultado."
                title="Mociones"
              />
              <DataTable
                columns={["Iniciativa", "Área", "Plazo", "Estado"]}
                rows={questions}
                source={sources.internal}
                subtitle="Preguntas, ruegos, solicitudes y vencimientos."
                title="Preguntas, ruegos y solicitudes"
              />
            </div>

            <DataTable
              columns={votePatterns[0]}
              rows={votePatterns.slice(1)}
              source={sources.internal}
              subtitle="Base preparada para detectar patrones políticos de votación."
              title="Votaciones por grupo"
            />
          </section>

          <section className="councillor-section" id="seguridad">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <AlertTriangle size={16} />
                  Seguridad
                </span>
                <h2>Policía Local, Guardia Civil y criminalidad</h2>
              </div>
              <FilterBar filters={["Resumen", "Policía Local", "Guardia Civil", "Criminalidad", "Asuntos abiertos"]} />
            </div>

            <div className="dashboard-kpi-grid">
              {securityKpis.map((kpi) => (
                <KPICard key={kpi.label} {...kpi} />
              ))}
            </div>

            <div className="dashboard-two-columns">
              <ChartCard
                data={crimeEvolution}
                source={sources.officialPending}
                subtitle="Carga manual de informes trimestrales del Ministerio del Interior."
                title="Evolución criminalidad trimestral"
              />
              <DataTable
                columns={["Asunto", "Prioridad", "Próxima acción", "Estado"]}
                rows={securityIssues}
                source={sources.internal}
                subtitle="Indicadores políticos y seguimiento de asuntos abiertos."
                title="Asuntos de seguridad abiertos"
              />
            </div>

            <div className="dashboard-two-columns">
              <EntityDetailView
                details={[
                  { label: "Competencia seguridad ciudadana", value: "Guardia Civil" },
                  { label: "Coordinación local", value: "Policía Local / Guardia Civil" },
                  { label: "Datos de efectivos", value: "Pendiente de solicitud o carga manual" },
                  { label: "Informes criminalidad", value: "Carga trimestral prevista" }
                ]}
                title="Guardia Civil y coordinación"
              />
              <EntityDetailView
                details={[
                  { label: "Nivel preocupación política", value: "Pendiente" },
                  { label: "Incidencia vecinal", value: "Pendiente" },
                  { label: "Necesidad pregunta pleno", value: "Evaluable por asunto" },
                  { label: "Necesidad nota prensa", value: "Evaluable por portavoz" }
                ]}
                title="Indicadores políticos de seguridad"
              />
            </div>
          </section>

          <section className="councillor-section" id="presupuesto-y-fiscalidad">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <FileText size={16} />
                  Presupuesto y fiscalidad
                </span>
                <h2>Economía municipal, ordenanzas y comparativa fiscal</h2>
              </div>
              <FilterBar filters={["Resumen", "Presupuesto", "Ordenanzas", "Haciendas Locales", "Comparativa"]} />
            </div>

            <div className="dashboard-kpi-grid">
              {budgetKpis.map((kpi) => (
                <KPICard key={kpi.label} {...kpi} />
              ))}
            </div>

            <div className="dashboard-two-columns">
              <ChartCard
                data={budgetEvolution}
                source={sources.internal}
                subtitle="Evolución anual 2023-2027 cuando se carguen presupuestos."
                title="Evolución presupuestaria"
              />
              <DataTable
                columns={["Ordenanza", "Tipo actual", "Mínimo legal", "Máximo legal", "Acción"]}
                rows={fiscalOrdinances}
                source={sources.internal}
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
              <ComparisonTable rows={comparisonRows} title="Comparativa con municipios cercanos" />
            </div>
          </section>

          <section className="councillor-section" id="documentos">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <FileText size={16} />
                  Documentos y fuentes
                </span>
                <h2>Documentación disponible para concejales</h2>
              </div>
            </div>
            <div className="document-grid">
              <DocumentCard
                source={sources.internal}
                status="Pendiente de carga por portavoz/admin"
                title="Informe trimestral de criminalidad"
                type="Seguridad"
              />
              <DocumentCard
                source={sources.internal}
                status="Pendiente de extracción y validación"
                title="Ordenanzas fiscales"
                type="Fiscalidad"
              />
              <DocumentCard
                source={sources.internal}
                status="Pendiente de carga estructurada"
                title="Presupuesto municipal"
                type="Presupuesto"
              />
              <DocumentCard
                source={sources.internal}
                status="Pendiente de extracción de medidas"
                title="Programa electoral"
                type="Programa electoral"
              />
            </div>
          </section>

          <section className="councillor-section" id="observaciones">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  <Star size={16} />
                  Observaciones del concejal
                </span>
                <h2>Acciones permitidas en esta fase</h2>
              </div>
            </div>
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
          </section>
        </main>
      </div>
    </div>
  );
}
