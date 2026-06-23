import { redirect } from "next/navigation";
import { Archive, Building2, CalendarPlus, FileText, Gauge, Landmark, UsersRound } from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { LogoUploadForm } from "@/components/admin/logo-upload-form";
import {
  CreateLegislatureForm,
  GenerateCalendarForm,
  LegislatureDocumentUploadForm,
  PlenaryScheduleForm,
  ReviewLegislatureDocumentForm,
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
    { data: committees }
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
      .order("name", { ascending: true })
  ]);

  const allLegislatures = (legislatures ?? []) as Legislature[];
  const activeLegislature = allLegislatures.find((item) => item.status === "active") ?? allLegislatures[0] ?? null;
  const activeDocuments = ((legislatureDocuments ?? []) as LegislatureDocument[]).filter(
    (document) => document.legislature_id === activeLegislature?.id
  );
  const progress = progressFor(activeLegislature, activeDocuments);

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
            <GenerateCalendarForm legislatureId={activeLegislature?.id ?? null} />
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
              <h2>Calendario ordinario base</h2>
              <p>Registra la regla de Pleno ordinario antes de generar eventos iniciales del calendario institucional.</p>
            </div>
            <CalendarPlus size={20} />
          </div>
          <PlenaryScheduleForm legislatureId={activeLegislature?.id ?? null} />
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
                    <ValidateLegislatureDocumentForm documentId={document.id} />
                  </header>
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
                  {((members ?? []) as MunicipalCorporationMember[]).length ? (
                    ((members ?? []) as MunicipalCorporationMember[]).map((member) => (
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
                  <div className="status-meta">{((groups ?? []) as MunicipalGroup[]).map((group) => group.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{(groups ?? []).length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Áreas de gobierno</div>
                  <div className="status-meta">{((areas ?? []) as GovernmentArea[]).map((area) => area.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{(areas ?? []).length}</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-title">Comisiones</div>
                  <div className="status-meta">{((committees ?? []) as StandingCommittee[]).map((committee) => committee.name).join(", ") || "Pendiente"}</div>
                </div>
                <span className="badge blue">{(committees ?? []).length}</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
