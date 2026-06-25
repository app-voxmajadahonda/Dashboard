import { redirect } from "next/navigation";
import { FileText, Gauge, Landmark, UsersRound } from "lucide-react";
import { AppBreadcrumbs } from "@/components/app/breadcrumbs";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import {
  CommitteeMembershipForm,
  CorporationMemberForm,
  CreateLegislatureForm,
  DelegationForm,
  GenerateCalendarForm,
  GovernmentAreaForm,
  MunicipalGroupForm,
  PlenaryScheduleForm,
  StandingCommitteeForm,
  CommitteeScheduleForm,
  TransparencyPortalImportForm,
  ValidateLegislatureForm
} from "@/components/admin/legislature-forms";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import type {
  CommitteeMembership,
  DelegatedCouncillor,
  GovernmentArea,
  Legislature,
  LegislatureDocument,
  MunicipalCorporationMember,
  MunicipalGroup,
  PlenaryRegularSchedule,
  StandingCommittee
} from "@/lib/types";

export const dynamic = "force-dynamic";

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

function roleLabel(role: string) {
  return role === "spokesperson" ? "Usuario portavoz" : "Usuario administrador";
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
    { data: generatedCalendarEvents },
    { data: activeLock },
    { data: transparencyJobs }
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
      .in("event_type", ["pleno", "comision"]),
    adminClient
      .from("system_locks")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("lock_type", "legislature_configuration")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
    adminClient
      .from("transparency_import_jobs")
      .select("*")
      .eq("organization_id", context.organization.id)
      .order("created_at", { ascending: false })
      .limit(1)
  ]);

  const allLegislatures = (legislatures ?? []) as Legislature[];
  const allMembers = (members ?? []) as MunicipalCorporationMember[];
  const allGroups = (groups ?? []) as MunicipalGroup[];
  const activeLegislature = allLegislatures.find((item) => item.status === "active") ?? allLegislatures[0] ?? null;
  const activeDocuments = ((legislatureDocuments ?? []) as LegislatureDocument[]).filter(
    (document) => document.legislature_id === activeLegislature?.id
  );
  const activeMembers = allMembers.filter((member) => member.legislature_id === activeLegislature?.id);
  const activeGroups = allGroups.filter((group) => group.legislature_id === activeLegislature?.id);
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
  const latestTransparencyJob = (transparencyJobs?.[0] ?? null) as {
    id: string;
    status: string;
    source_url: string;
    created_at: string;
    metadata: Record<string, unknown>;
  } | null;
  const legislatureLocked = Boolean(activeLock);
  const displayRole = roleLabel(context.membership.role);

  const activeStats = [
    ["Concejales", activeMembers.length],
    ["Grupos", activeGroups.length],
    ["Areas", activeAreas.length],
    ["Comisiones", activeCommittees.length],
    ["Delegaciones", activeDelegations.length],
    ["Miembros de comision", activeMemberships.length],
    ["Reglas de Pleno", activePlenarySchedules.length],
    ["Eventos generados", (generatedCalendarEvents ?? []).length]
  ] as const;

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header compact-private-header">
          <div>
            <AppBreadcrumbs
              icon={<Landmark size={16} />}
              items={[
                { href: "/dashboard", label: displayRole },
                { href: "/admin/config", label: "Configuracion" },
                { label: "Legislatura" }
              ]}
            />
            <h1>Legislatura</h1>
            <p>Importacion guiada desde el Portal de Transparencia y revision de la legislatura activa.</p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Legislaturas registradas</h2>
              <p>La legislatura activa aparece resaltada. Pulsa una tarjeta para ver el detalle.</p>
            </div>
            <Landmark size={20} />
          </div>

          {allLegislatures.length ? (
            <div className="legislature-selector-grid">
              {allLegislatures.map((legislature) => {
                const isActive = legislature.id === activeLegislature?.id;

                return (
                  <a
                    className="legislature-card"
                    data-active={isActive}
                    href={`#legislature-${legislature.id}`}
                    key={legislature.id}
                  >
                    <span className={isActive ? "badge green" : "badge"}>{isActive ? "Actual" : legislature.status}</span>
                    <strong>{legislature.name}</strong>
                    <p>
                      {formatDate(legislature.start_date)} - {formatDate(legislature.end_date)}
                    </p>
                    <small>{legislature.configuration_status}</small>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">Aun no hay legislaturas registradas.</div>
          )}

          <details className="legislature-create-panel">
            <summary>Crear nueva legislatura</summary>
            <CreateLegislatureForm />
          </details>
        </section>

        {allLegislatures.map((legislature) => {
          const isActive = legislature.id === activeLegislature?.id;
          const legislatureMembers = allMembers.filter((member) => member.legislature_id === legislature.id);
          const legislatureGroups = allGroups.filter((group) => group.legislature_id === legislature.id);

          return (
            <aside className="legislature-modal" id={`legislature-${legislature.id}`} key={legislature.id}>
              <article className="legislature-modal-card">
                <header>
                  <div>
                    <span className={isActive ? "badge green" : "badge"}>{isActive ? "Legislatura actual" : legislature.status}</span>
                    <h2>{legislature.name}</h2>
                    <p>
                      {formatDate(legislature.start_date)} - {formatDate(legislature.end_date)}
                    </p>
                  </div>
                  <a className="button" href="/admin/legislature">
                    Cerrar
                  </a>
                </header>
                <div className="legislature-modal-grid">
                  <div>
                    <span>Estado de configuracion</span>
                    <strong>{legislature.configuration_status}</strong>
                  </div>
                  <div>
                    <span>Validada</span>
                    <strong>{formatDate(legislature.validated_at)}</strong>
                  </div>
                  <div>
                    <span>Concejales</span>
                    <strong>{legislatureMembers.length}</strong>
                  </div>
                  <div>
                    <span>Grupos</span>
                    <strong>{legislatureGroups.length}</strong>
                  </div>
                </div>
              </article>
            </aside>
          );
        })}

        {legislatureLocked ? (
          <section className="panel">
            <div className="critical-warning">
              Importacion institucional en curso. La configuracion de legislatura esta bloqueada temporalmente hasta que
              finalice o expire el bloqueo de seguridad.
            </div>
          </section>
        ) : null}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Importar desde Portal de Transparencia</h2>
              <p>Proceso guiado para localizar datos institucionales, fuentes y documentos oficiales del mandato.</p>
            </div>
            <FileText size={20} />
          </div>
          <TransparencyPortalImportForm
            defaultUrl="https://transparencia.majadahonda.org/"
            disabled={legislatureLocked}
            job={latestTransparencyJob}
            legislatureId={activeLegislature?.id ?? null}
          />
        </section>

        <section className="panel legislature-progress-panel">
          <div className="panel-header">
            <div>
              <h2>Datos de la legislatura activa</h2>
              <p>
                {activeLegislature
                  ? `${activeLegislature.name} · ${formatDate(activeLegislature.start_date)} - ${formatDate(activeLegislature.end_date)}`
                  : "Crea o importa una legislatura para empezar."}
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
            <ValidateLegislatureForm legislatureId={activeLegislature?.id ?? null} />
          </div>

          <div className="legislature-data-grid">
            {activeStats.map(([label, value]) => (
              <article className="legislature-data-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Composicion del Pleno</h2>
                <p>Datos consolidados de la legislatura activa.</p>
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
                        <td>{member.role ?? (member.is_mayor ? "Alcaldia" : "-")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No hay concejales validados todavia.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Estructura institucional</h2>
                <p>Grupos, areas, comisiones y delegaciones disponibles.</p>
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
                  <div className="status-title">Areas de gobierno</div>
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
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Corregir datos de la legislatura</h2>
              <p>Correcciones manuales posteriores a la importacion desde el portal oficial.</p>
            </div>
            <UsersRound size={20} />
          </div>
          <div className="legislature-accordion-grid">
            <details>
              <summary>Composicion y grupos municipales</summary>
              <CorporationMemberForm legislatureId={activeLegislature?.id ?? null} members={activeMembers} />
              <MunicipalGroupForm groups={activeGroups} legislatureId={activeLegislature?.id ?? null} />
            </details>
            <details>
              <summary>Gobierno municipal y delegaciones</summary>
              <GovernmentAreaForm areas={activeAreas} legislatureId={activeLegislature?.id ?? null} members={activeMembers} />
              <DelegationForm
                areas={activeAreas}
                delegations={activeDelegations}
                legislatureId={activeLegislature?.id ?? null}
                members={activeMembers}
              />
            </details>
            <details>
              <summary>Comisiones y calendario institucional</summary>
              <StandingCommitteeForm committees={activeCommittees} legislatureId={activeLegislature?.id ?? null} />
              <CommitteeMembershipForm
                committees={activeCommittees}
                legislatureId={activeLegislature?.id ?? null}
                memberships={activeMemberships}
                members={activeMembers}
              />
              <PlenaryScheduleForm legislatureId={activeLegislature?.id ?? null} schedules={activePlenarySchedules} />
              <CommitteeScheduleForm committees={activeCommittees} legislatureId={activeLegislature?.id ?? null} />
              <GenerateCalendarForm legislatureId={activeLegislature?.id ?? null} />
              <div className="status-list legislature-step-list">
                <div className="status-item">
                  <div>
                    <div className="status-title">Reglas de Pleno</div>
                    <div className="status-meta">
                      {activePlenarySchedules.map((schedule) => schedule.rule_description).join(", ") || "Pendiente"}
                    </div>
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
      </main>
    </div>
  );
}
