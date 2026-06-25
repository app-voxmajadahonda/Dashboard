import { redirect } from "next/navigation";
import { Archive, Building2, CalendarPlus, FileText, Gauge, Landmark, UsersRound } from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { LogoUploadForm } from "@/components/admin/logo-upload-form";
import {
  CommitteeMembershipForm,
  CorporationMemberForm,
  CreateLegislatureForm,
  DelegationForm,
  DiscardLegislatureDocumentForm,
  GenerateCalendarForm,
  GovernmentAreaForm,
  LegislatureDocumentUploadForm,
  MunicipalGroupForm,
  PlenaryScheduleForm,
  ReviewLegislatureDocumentForm,
  StandingCommitteeForm,
  CommitteeScheduleForm,
  ValidateLegislatureDocumentForm,
  ValidateLegislatureForm
} from "@/components/admin/legislature-forms";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import type {
  GovernmentArea,
  Legislature,
  LegislatureDocument,
  MunicipalCorporationMember,
  MunicipalGroup,
  CommitteeMembership,
  DelegatedCouncillor,
  PlenaryRegularSchedule,
  StandingCommittee
} from "@/lib/types";

export const dynamic = "force-dynamic";

const requiredDocuments = [
  ["organization_plenary", "Pleno de Organización y Funcionamiento"],
  ["delegation_decree", "Decreto de delegaciones"],
  ["committee_creation", "Acuerdo de creación de comisiones"],
  ["municipal_group_composition", "Composición del Pleno / Grupo Municipal"],
  ["municipal_rom", "ROM municipal"],
  ["logo", "Logo del Grupo Municipal"]
];

const officialLegislatureSources = [
  {
    title: "Órganos de Gobierno Municipal",
    url: "https://transparencia.majadahonda.org/organos-de-gobierno-municipal",
    detail: "Índice oficial para grupos políticos, Pleno, comisiones, Junta de Gobierno y decretos de organización."
  },
  {
    title: "Estructura Organizativa del Ayuntamiento",
    url: "https://transparencia.majadahonda.org/estructura-organizativa",
    detail: "Fuente oficial para alcaldía, equipo de gobierno, tenencias de alcaldía, áreas y concejalías."
  },
  {
    title: "Legislatura 2023-2027",
    url: "https://transparencia.majadahonda.org/legislatura-2023-2027",
    detail: "Grupos políticos municipales y datos biográficos de alcaldesa y concejales."
  },
  {
    title: "Información general sobre órganos de gobierno",
    url: "https://transparencia.majadahonda.org/organos-de-gobierno",
    detail: "Regla publicada: Pleno ordinario mensual el último martes de cada mes a las 10:00; agosto suspendido."
  },
  {
    title: "Acuerdos y decretos de organización",
    url: "https://transparencia.majadahonda.org/acuerdos-y-decretos-organizacion-funcionamiento",
    detail: "Decretos y acuerdos para delegaciones, áreas, tenencias y cambios organizativos."
  }
];

function progressFor(legislature: Legislature | null, documents: LegislatureDocument[]) {
  if (!legislature) {
    return 0;
  }

  if (legislature.configuration_status === "validated") {
    return 100;
  }

  if (documents.some((document) => document.status === "validated")) {
    return 75;
  }

  if (documents.some((document) => ["extracted", "needs_review"].includes(document.status))) {
    return 50;
  }

  if (documents.length) {
    return 25;
  }

  return 0;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("es-ES") : "Sin fecha";
}

function statusForRole(role: string, documents: LegislatureDocument[]) {
  const document = documents.find((item) => item.document_role === role);
  return document?.status ?? "pendiente";
}

function documentSummary(document: LegislatureDocument, key: "extracted_data" | "reviewed_data") {
  const value = document[key] ?? {};
  const text = JSON.stringify(value, null, 2);
  return text.length > 420 ? `${text.slice(0, 420)}...` : text;
}

export default async function LegislatureConfigurationPage() {
  const user = await requireUser();

  let context: Awaited<ReturnType<typeof requireOrganizationAdmin>>;
  try {
    context = await requireOrganizationAdmin(user.id);
  } catch {
    redirect("/concejal");
  }

  const adminClient = getSupabaseAdminClient();
  const [
    { data: legislatures },
    { data: legislatureDocuments },
    { data: members },
    { data: groups },
    { data: areas },
    { data: committees },
    { data: delegations },
    { data: memberships },
    { data: plenarySchedules },
    { data: committeeSchedules },
    { data: generatedCalendarEvents }
  ] = await Promise.all([
    adminClient
      .from("legislatures")
      .select("*")
      .eq("organization_id", context.organization.id)
      .order("start_date", { ascending: false }),
    adminClient
      .from("legislature_documents")
      .select("*")
      .eq("organization_id", context.organization.id)
      .order("created_at", { ascending: false }),
    adminClient
      .from("municipal_corporation_members")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true)
      .order("order_number", { ascending: true }),
    adminClient
      .from("municipal_groups")
      .select("*")
      .eq("organization_id", context.organization.id)
      .order("seats", { ascending: false, nullsFirst: false }),
    adminClient
      .from("government_areas")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true)
      .order("name", { ascending: true }),
    adminClient
      .from("standing_committees")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true)
      .order("name", { ascending: true }),
    adminClient
      .from("delegated_councillors")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true)
      .order("delegation_title", { ascending: true }),
    adminClient
      .from("committee_memberships")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true),
    adminClient
      .from("plenary_regular_schedule")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true),
    adminClient
      .from("committee_regular_schedule")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("active", true),
    adminClient
      .from("calendar_events")
      .select("id")
      .eq("organization_id", context.organization.id)
      .in("event_type", ["pleno", "comision"])
  ]);

  const allLegislatures = (legislatures ?? []) as Legislature[];
  const activeLegislature = allLegislatures.find((item) => item.status === "active") ?? allLegislatures[0] ?? null;
  const activeDocuments = ((legislatureDocuments ?? []) as LegislatureDocument[]).filter(
    (document) => document.legislature_id === activeLegislature?.id
  );
  const activeMembers = ((members ?? []) as MunicipalCorporationMember[]).filter(
    (member) => member.legislature_id === activeLegislature?.id
  );
  const activeGroups = ((groups ?? []) as MunicipalGroup[]).filter((group) => group.legislature_id === activeLegislature?.id);
  const activeAreas = ((areas ?? []) as GovernmentArea[]).filter((area) => area.legislature_id === activeLegislature?.id);
  const activeCommittees = ((committees ?? []) as StandingCommittee[]).filter(
    (committee) => committee.legislature_id === activeLegislature?.id
  );
  const activeDelegations = ((delegations ?? []) as DelegatedCouncillor[]).filter(
    (delegation) => delegation.legislature_id === activeLegislature?.id
  );
  const activeMemberships = ((memberships ?? []) as CommitteeMembership[]).filter(
    (membership) => membership.legislature_id === activeLegislature?.id
  );
  const activePlenarySchedules = ((plenarySchedules ?? []) as PlenaryRegularSchedule[]).filter(
    (schedule) => schedule.legislature_id === activeLegislature?.id
  );
  const activeCommitteeSchedules = (committeeSchedules ?? []).filter(
    (schedule) => schedule.legislature_id === activeLegislature?.id
  );
  const progress = progressFor(activeLegislature, activeDocuments);
  const hasVoxGroup = activeGroups.some((group) => group.name.toLowerCase().includes("vox"));
  const hasVoxSpokesperson = activeGroups.some(
    (group) => group.name.toLowerCase().includes("vox") && Boolean(group.spokesperson_name)
  );
  const readinessItems = [
    ["Legislatura creada", Boolean(activeLegislature)],
    ["Documentos cargados", activeDocuments.length > 0],
    ["Datos revisados", activeDocuments.some((document) => ["needs_review", "validated"].includes(document.status))],
    ["Composición del Pleno", activeMembers.length > 0],
    ["Grupos municipales", activeGroups.length > 0],
    ["Grupo VOX identificado", hasVoxGroup],
    ["Portavoz VOX identificado", hasVoxSpokesperson],
    ["Regla ordinaria de Pleno", activePlenarySchedules.length > 0],
    ["Calendario generado", (generatedCalendarEvents ?? []).length > 0],
    ["Legislatura activa", activeLegislature?.status === "active"]
  ] as const;

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header compact-private-header">
          <div>
            <span className="eyebrow">
              <Landmark size={16} />
              Configuración inicial
            </span>
            <h1>Configuración de Legislatura</h1>
            <p>Documentos base, revisión humana y marco institucional de trabajo del mandato.</p>
          </div>
        </header>

        <section className="panel legislature-progress-panel">
          <div className="panel-header">
            <div>
              <h2>Legislatura activa</h2>
              <p>
                {activeLegislature
                  ? `${activeLegislature.name} · ${formatDate(activeLegislature.start_date)} - ${formatDate(activeLegislature.end_date)}`
                  : "Aún no hay legislatura creada."}
              </p>
            </div>
            <Gauge size={20} />
          </div>
          <div className="legislature-progress">
            <div>
              <strong>{progress}%</strong>
              <span>{activeLegislature?.configuration_status ?? "pending"}</span>
            </div>
            <i>
              <span style={{ width: `${progress}%` }} />
            </i>
          </div>
          <div className="legislature-actions">
            <CreateLegislatureForm />
            <ValidateLegislatureForm legislatureId={activeLegislature?.id ?? null} />
          </div>
          <div className="status-list legislature-step-list">
            {readinessItems.map(([label, ready]) => (
              <div className="status-item" key={label}>
                <div>
                  <div className="status-title">{label}</div>
                  <div className="status-meta">{ready ? "Completado" : "Pendiente"}</div>
                </div>
                <span className={ready ? "badge green" : "badge"}>{ready ? "OK" : "Falta"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Documentos iniciales de legislatura</h2>
                <p>Subida documental con extracción pendiente y revisión humana obligatoria.</p>
              </div>
              <FileText size={20} />
            </div>
            <LegislatureDocumentUploadForm legislatureId={activeLegislature?.id ?? null} />
            <div className="status-list legislature-document-list">
              {requiredDocuments.map(([role, label]) => (
                <div className="status-item" key={role}>
                  <div>
                    <div className="status-title">{label}</div>
                    <div className="status-meta">{role}</div>
                  </div>
                  <span className="badge blue">{statusForRole(role, activeDocuments)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Logo</h2>
                <p>Imagen usada en portada pública y barra privada.</p>
              </div>
              <Building2 size={20} />
            </div>
            <LogoUploadForm />
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Fuentes oficiales de legislatura</h2>
              <p>Referencias del Portal de Transparencia de Majadahonda para completar los datos institucionales.</p>
            </div>
            <Landmark size={20} />
          </div>
          <div className="requirement-grid">
            {officialLegislatureSources.map((source) => (
              <article className="requirement-card" key={source.url}>
                <strong>{source.title}</strong>
                <p>{source.detail}</p>
                <a href={source.url} rel="noreferrer" target="_blank">
                  Abrir fuente oficial
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Calendario ordinario base</h2>
              <p>Registra reglas ordinarias de Pleno y comisiones antes de generar eventos institucionales.</p>
            </div>
            <CalendarPlus size={20} />
          </div>
          <div className="legislature-accordion-grid">
            <details open>
              <summary>Régimen ordinario de Pleno</summary>
              <PlenaryScheduleForm legislatureId={activeLegislature?.id ?? null} schedules={activePlenarySchedules} />
            </details>
            <details>
              <summary>Régimen ordinario de comisiones</summary>
              <CommitteeScheduleForm committees={activeCommittees} legislatureId={activeLegislature?.id ?? null} />
            </details>
            <details>
              <summary>Generar calendario institucional</summary>
              <GenerateCalendarForm legislatureId={activeLegislature?.id ?? null} />
              <div className="status-list">
                <div className="status-item">
                  <div>
                    <div className="status-title">Reglas de Pleno</div>
                    <div className="status-meta">{activePlenarySchedules.map((schedule) => schedule.rule_description).join(", ") || "Pendiente"}</div>
                  </div>
                  <span className="badge blue">{activePlenarySchedules.length}</span>
                </div>
                <div className="status-item">
                  <div>
                    <div className="status-title">Reglas de comisiones</div>
                    <div className="status-meta">Reglas registradas para comisiones ordinarias</div>
                  </div>
                  <span className="badge blue">{activeCommitteeSchedules.length}</span>
                </div>
              </div>
            </details>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Bandeja de revisión</h2>
              <p>Los datos detectados no se consolidan sin revisión humana.</p>
            </div>
            <Archive size={20} />
          </div>
          <div className="review-grid">
            {activeDocuments.length ? (
              activeDocuments.map((document) => (
                <article className="review-card" key={document.id}>
                  <header>
                    <div>
                      <strong>{document.document_role}</strong>
                      <span>{document.status}</span>
                    </div>
                    <div className="form-actions-row">
                      <ValidateLegislatureDocumentForm documentId={document.id} />
                      <DiscardLegislatureDocumentForm documentId={document.id} />
                    </div>
                  </header>
                  <div className="extraction-compare-grid">
                    <div>
                      <strong>Datos extraídos</strong>
                      <pre>{documentSummary(document, "extracted_data")}</pre>
                    </div>
                    <div>
                      <strong>Datos revisados</strong>
                      <pre>{documentSummary(document, "reviewed_data")}</pre>
                    </div>
                    <div>
                      <strong>Datos consolidados</strong>
                      <p>
                        Se consolidan al validar el documento si el JSON revisado contiene concejales, grupos, áreas,
                        comisiones o calendario de plenos.
                      </p>
                    </div>
                  </div>
                  <ReviewLegislatureDocumentForm document={document} />
                </article>
              ))
            ) : (
              <div className="empty-state">
                Aún no hay documentos de legislatura. Crea una legislatura y sube el Pleno de Organización, el decreto de delegaciones o el ROM.
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Formularios estructurados</h2>
              <p>Completa o corrige manualmente los datos institucionales validados de la legislatura.</p>
            </div>
            <UsersRound size={20} />
          </div>
          <div className="legislature-accordion-grid">
            <details open>
              <summary>Composición del Pleno</summary>
              <CorporationMemberForm legislatureId={activeLegislature?.id ?? null} members={activeMembers} />
            </details>
            <details>
              <summary>Grupos municipales</summary>
              <MunicipalGroupForm groups={activeGroups} legislatureId={activeLegislature?.id ?? null} />
            </details>
            <details>
              <summary>Áreas de gobierno</summary>
              <GovernmentAreaForm areas={activeAreas} legislatureId={activeLegislature?.id ?? null} members={activeMembers} />
            </details>
            <details>
              <summary>Delegaciones</summary>
              <DelegationForm
                areas={activeAreas}
                delegations={activeDelegations}
                legislatureId={activeLegislature?.id ?? null}
                members={activeMembers}
              />
            </details>
            <details>
              <summary>Comisiones informativas</summary>
              <StandingCommitteeForm committees={activeCommittees} legislatureId={activeLegislature?.id ?? null} />
            </details>
            <details>
              <summary>Miembros de comisiones</summary>
              <CommitteeMembershipForm
                committees={activeCommittees}
                legislatureId={activeLegislature?.id ?? null}
                memberships={activeMemberships}
                members={activeMembers}
              />
            </details>
          </div>
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Composición municipal validada</h2>
                <p>Datos definitivos tras revisión.</p>
              </div>
              <UsersRound size={20} />
            </div>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Concejal</th>
                    <th>Grupo</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMembers.length ? (
                    activeMembers.map((member) => (
                      <tr key={member.id}>
                        <td>{member.full_name}</td>
                        <td>{member.political_group ?? "-"}</td>
                        <td>{member.role ?? (member.is_mayor ? "Alcaldía" : "-")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No hay concejales validados todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Grupos, áreas y comisiones</h2>
                <p>Marco institucional disponible para procesos posteriores.</p>
              </div>
              <Landmark size={20} />
            </div>
            <div className="status-list">
              <div className="status-item">
                <div>
                  <div className="status-title">Grupos municipales</div>
                  <div className="status-meta">{activeGroups.map((group) => group.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{activeGroups.length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Áreas de gobierno</div>
                  <div className="status-meta">{activeAreas.map((area) => area.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{activeAreas.length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Comisiones</div>
                  <div className="status-meta">{activeCommittees.map((committee) => committee.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{activeCommittees.length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Delegaciones</div>
                  <div className="status-meta">{activeDelegations.map((delegation) => delegation.delegation_title).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{activeDelegations.length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Miembros de comisiones</div>
                  <div className="status-meta">Titulares y suplentes configurados</div>
                </div>
                <span className="badge blue">{activeMemberships.length}</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
