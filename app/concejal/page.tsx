import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderKanban,
  MessageSquarePlus,
  Star,
  Users
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
  KPICard
} from "@/components/dashboard/dashboard-components";
import { CouncillorObservationForm } from "@/components/dashboard/councillor-observation-form";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import municipalProfile from "@/config/municipal-profile.json";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getCouncillorDashboardData } from "@/lib/data/councillor-dashboard";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const councillorTabs = [
  { label: "Datos generales", href: "#datos-generales", icon: Users },
  { label: "Fiscalidad y presupuesto", href: "#fiscalidad-presupuesto", icon: FileText },
  { label: "Seguimiento de contratos", href: "#contratos", icon: BriefcaseBusiness },
  { label: "Seguimiento de proyectos", href: "#proyectos", icon: FolderKanban },
  { label: "Análisis electoral", href: "#analisis-electoral", icon: BarChart3 }
];

const sharedTasks = [
  ["Revisar documentación pendiente", "Portavoz/admin", "Esta semana"],
  ["Preparar observaciones para próximo pleno", "Concejal", "Pendiente"],
  ["Validar fuente de indicadores municipales", "Equipo", "Sin fecha"]
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
              Los datos deben proceder de fuentes oficiales, cargas documentales o validación del
              portavoz, con fuente y caducidad identificadas.
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

        <section className="shared-dashboard-grid" aria-label="Calendario, alertas y tareas">
          <article className="dashboard-card">
            <header className="dashboard-card-header">
              <div>
                <h2>Calendario</h2>
                <p>Plenos, comisiones y vencimientos que afecten al concejal.</p>
              </div>
              <CalendarClock size={20} />
            </header>
            <CalendarView events={dashboard.institutionalEvents} />
          </article>

          <div className="alert-stack">
            <AlertCard
              detail="Cada alerta deberá vincularse a un dato, documento, pleno, comisión o tarea."
              priority="alta"
              source={dashboard.sources.internal}
              title="Alertas del concejal"
            />
            <AlertCard
              detail="Los datos caducados aparecerán marcados como desactualizados hasta revisión."
              priority="media"
              source={dashboard.sources.officialPending}
              title="Control de vigencia del dato"
            />
          </div>

          <article className="dashboard-card">
            <header className="dashboard-card-header">
              <div>
                <h2>Tareas pendientes</h2>
                <p>Zona común que después se alimentará desde tareas reales.</p>
              </div>
              <CheckCircle2 size={20} />
            </header>
            <div className="status-list">
              {sharedTasks.map(([title, owner, deadline]) => (
                <div className="status-item" key={title}>
                  <div>
                    <div className="status-title">{title}</div>
                    <div className="status-meta">{owner}</div>
                  </div>
                  <span className="badge green">{deadline}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <nav className="dashboard-tabs operational-tabs" aria-label="Pestañas operativas del concejal">
          {councillorTabs.map((tab, index) => (
            <a data-active={index === 0} href={tab.href} key={tab.href}>
              <tab.icon size={16} />
              {tab.label}
            </a>
          ))}
        </nav>

        <section className="councillor-section" id="datos-generales">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <Users size={16} />
                Datos generales
              </span>
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
        </section>

        <section className="councillor-section" id="fiscalidad-presupuesto">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <FileText size={16} />
                Fiscalidad y presupuesto
              </span>
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
        </section>

        <section className="councillor-section" id="contratos">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <BriefcaseBusiness size={16} />
                Seguimiento de contratos
              </span>
              <h2>Contratación, adjudicaciones y expedientes vinculados</h2>
            </div>
            <FilterBar filters={["Todos", "Abiertos", "Adjudicados", "Prórrogas", "Alertas"]} />
          </div>
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
        </section>

        <section className="councillor-section" id="proyectos">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <FolderKanban size={16} />
                Seguimiento de proyectos
              </span>
              <h2>Proyectos municipales, expedientes e hitos</h2>
            </div>
            <FilterBar filters={["Todos", "Urbanismo", "Servicios", "Seguridad", "Presupuesto"]} />
          </div>
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
        </section>

        <section className="councillor-section" id="analisis-electoral">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <BarChart3 size={16} />
                Análisis electoral
              </span>
              <h2>Resultados, evolución de VOX y programa electoral</h2>
            </div>
            <FilterBar filters={["Resultados", "VOX", "Programa", "Barrios", "Comparativa"]} />
          </div>
          <div className="dashboard-two-columns">
            <DataTable
              columns={["Dato", "Valor", "Fuente", "Estado"]}
              rows={[
                ["Resultados 2019", "Pendiente", "Ministerio / Junta Electoral", "Pendiente"],
                ["Resultados 2023", "Pendiente", "Ministerio / Junta Electoral", "Pendiente"],
                ["Evolución VOX", "Pendiente", "Cálculo interno validado", "Pendiente"],
                ["Medidas del programa", "Pendiente", "Programa electoral cargado", "Pendiente"]
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
            {dashboard.documentCards.map((document) => (
              <DocumentCard key={`${document.type}-${document.title}`} {...document} />
            ))}
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
          <CouncillorObservationForm />
        </section>
      </main>
    </div>
  );
}
