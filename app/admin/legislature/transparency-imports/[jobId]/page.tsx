import { redirect } from "next/navigation";
import { ArrowLeft, DatabaseZap, FileText, GitCompareArrows, History, ListChecks } from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { TransparencyImportReviewActions } from "@/components/admin/transparency-import-review-actions";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import type { TransparencyImportDiff, TransparencyImportJob, TransparencyImportSource, TransparencyImportStaging } from "@/lib/types";

export const dynamic = "force-dynamic";

const supportedTables = {
  municipal_corporation_member: "municipal_corporation_members",
  municipal_group: "municipal_groups",
  government_area: "government_areas",
  delegated_councillor: "delegated_councillors",
  standing_committee: "standing_committees",
  plenary_regular_schedule: "plenary_regular_schedule",
  committee_regular_schedule: "committee_regular_schedule"
} as const;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("es-ES") : "Sin fecha";
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function shortJson(value: Record<string, unknown>) {
  const text = JSON.stringify(value, null, 2);
  return text.length > 700 ? `${text.slice(0, 700)}...` : text;
}

function proposalFor(item: TransparencyImportStaging) {
  const data = asRecord(item.extracted_data);
  const title = firstString(data.title, data.name, data.nombre);

  if (item.entity_type === "municipal_corporation_member") {
    return {
      full_name: firstString(data.full_name, data.nombre, data.name, title),
      political_group: firstString(data.political_group, data.grupo, data.grupo_municipal),
      party: firstString(data.party, data.partido),
      role: firstString(data.role, data.cargo),
      source_url: firstString(data.url, data.source_url)
    };
  }

  if (item.entity_type === "municipal_group") {
    return {
      name: firstString(data.name, data.nombre, data.group_name, title),
      party: firstString(data.party, data.partido),
      spokesperson_name: firstString(data.spokesperson_name, data.portavoz),
      seats: data.seats ?? data.escanos,
      source_url: firstString(data.url, data.source_url)
    };
  }

  if (item.entity_type === "government_area") {
    return {
      name: firstString(data.name, data.nombre, title),
      description: firstString(data.description, data.descripcion),
      competencies: data.competencies ?? data.competencias,
      source_url: firstString(data.url, data.source_url)
    };
  }

  if (item.entity_type === "delegated_councillor") {
    return {
      delegation_title: firstString(data.delegation_title, data.titulo, data.nombre, title),
      decree_reference: firstString(data.decree_reference, data.decreto),
      competencies: data.competencies ?? data.competencias,
      source_url: firstString(data.url, data.source_url)
    };
  }

  if (item.entity_type === "standing_committee") {
    return {
      name: firstString(data.name, data.nombre, title),
      committee_type: firstString(data.committee_type, data.tipo),
      ordinary_schedule_rule: firstString(data.ordinary_schedule_rule, data.regimen_ordinario),
      source_url: firstString(data.url, data.source_url)
    };
  }

  if (item.entity_type === "plenary_regular_schedule" || item.entity_type === "committee_regular_schedule") {
    return {
      rule_description: firstString(data.rule_description, data.regla, data.descripcion, title),
      frequency: firstString(data.frequency, data.frecuencia),
      weekday: firstString(data.weekday, data.dia_semana),
      time: firstString(data.time, data.hora),
      source_url: firstString(data.url, data.source_url)
    };
  }

  return {
    title,
    source_url: firstString(data.url, data.source_url)
  };
}

function identityField(entityType: string) {
  if (entityType === "municipal_corporation_member") return "full_name";
  if (entityType === "delegated_councillor") return "delegation_title";
  if (entityType === "plenary_regular_schedule" || entityType === "committee_regular_schedule") return "rule_description";
  return "name";
}

async function loadCurrentRecords(
  organizationId: string,
  items: TransparencyImportStaging[]
): Promise<Record<string, Record<string, unknown> | null>> {
  const adminClient = getSupabaseAdminClient();
  const result: Record<string, Record<string, unknown> | null> = {};

  for (const item of items) {
    const table = supportedTables[item.entity_type as keyof typeof supportedTables];
    const proposed = proposalFor(item);
    const field = identityField(item.entity_type);
    const value = proposed[field as keyof typeof proposed];

    if (!table || !value || typeof value !== "string") {
      result[item.id] = null;
      continue;
    }

    const query = adminClient
      .from(table)
      .select("*")
      .eq("organization_id", organizationId)
      .eq("legislature_id", item.legislature_id)
      .ilike(field, value);

    const { data } = await query.maybeSingle();
    result[item.id] = asRecord(data);
  }

  return result;
}

function ComparisonTable({
  current,
  proposed
}: {
  current: Record<string, unknown> | null;
  proposed: Record<string, unknown>;
}) {
  const fields = Object.keys(proposed).filter((field) => proposed[field] !== null && proposed[field] !== undefined && field !== "source_url");

  return (
    <div className="comparison-table">
      <div className="comparison-row comparison-head">
        <span>Campo</span>
        <span>Dato actual</span>
        <span>Dato detectado</span>
      </div>
      {fields.length ? (
        fields.map((field) => (
          <div className="comparison-row" key={field}>
            <span>{field}</span>
            <span>{displayValue(current?.[field])}</span>
            <strong>{displayValue(proposed[field])}</strong>
          </div>
        ))
      ) : (
        <div className="empty-state">El dato detectado no contiene campos estructurados aplicables.</div>
      )}
    </div>
  );
}

export default async function TransparencyImportReviewPage({ params }: { params: Promise<{ jobId: string }> }) {
  const user = await requireUser();
  const { jobId } = await params;

  let context: Awaited<ReturnType<typeof requireOrganizationAdmin>>;
  try {
    context = await requireOrganizationAdmin(user.id);
  } catch {
    redirect("/concejal");
  }

  const adminClient = getSupabaseAdminClient();
  const [{ data: job }, { data: sources }, { data: staging }, { data: diffs }] = await Promise.all([
    adminClient
      .from("transparency_import_jobs")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("id", jobId)
      .single(),
    adminClient
      .from("transparency_import_sources")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("job_id", jobId)
      .order("category", { ascending: true })
      .limit(200),
    adminClient
      .from("transparency_import_staging")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })
      .limit(200),
    adminClient
      .from("transparency_import_diffs")
      .select("*")
      .eq("organization_id", context.organization.id)
      .eq("job_id", jobId)
      .order("risk_level", { ascending: false })
      .limit(200)
  ]);

  if (!job) {
    redirect("/admin/legislature");
  }

  const importJob = job as TransparencyImportJob;
  const importSources = (sources ?? []) as TransparencyImportSource[];
  const importStaging = (staging ?? []) as TransparencyImportStaging[];
  const importDiffs = (diffs ?? []) as TransparencyImportDiff[];
  const metadata = importJob.metadata ?? {};
  const currentRecords = await loadCurrentRecords(context.organization.id, importStaging);
  const { data: changeLog } = await adminClient
    .from("legislature_change_log")
    .select("*")
    .eq("organization_id", context.organization.id)
    .eq("import_job_id", importJob.id)
    .order("applied_at", { ascending: false })
    .limit(50);

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header compact-private-header">
          <div>
            <a className="button" href="/admin/legislature">
              <ArrowLeft size={16} />
              Volver a legislatura
            </a>
            <span className="eyebrow">
              <DatabaseZap size={16} />
              Importacion institucional
            </span>
            <h1>Revision del Portal de Transparencia</h1>
            <p>{importJob.source_url}</p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Estado de la importacion</h2>
              <p>
                {importJob.status} · iniciado {formatDate(importJob.started_at)} · finalizado {formatDate(importJob.finished_at)}
              </p>
            </div>
            <TransparencyImportReviewActions jobId={importJob.id} />
          </div>
          <div className="status-list">
            <div className="status-item">
              <div>
                <div className="status-title">Fuentes descubiertas</div>
                <div className="status-meta">URLs y documentos localizados</div>
              </div>
              <span className="badge blue">{String(metadata.sourcesDiscovered ?? importSources.length)}</span>
            </div>
            <div className="status-item">
              <div>
                <div className="status-title">Documentos descargados</div>
                <div className="status-meta">Guardados en Supabase Storage si procede</div>
              </div>
              <span className="badge blue">{String(metadata.downloadedDocuments ?? "-")}</span>
            </div>
            <div className="status-item">
              <div>
                <div className="status-title">Cambios aplicados</div>
                <div className="status-meta">Con trazabilidad en historial de legislatura</div>
              </div>
              <span className="badge green">{(changeLog ?? []).length}</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Datos detectados frente a datos actuales</h2>
              <p>Aprueba o aplica cada cambio. Todo cambio aplicado queda fechado y auditado.</p>
            </div>
            <ListChecks size={20} />
          </div>
          <div className="review-grid">
            {importStaging.length ? (
              importStaging.map((item) => {
                const proposed = proposalFor(item);
                const current = currentRecords[item.id] ?? null;
                const sourceUrl = proposed.source_url;
                const canApply = item.status === "approved" || item.status === "needs_review";

                return (
                  <article className="review-card import-review-card" key={item.id}>
                    <header>
                      <div>
                        <strong>{item.entity_type}</strong>
                        <span>
                          {item.status} · confianza {item.confidence ?? "-"} · {current ? "actualiza registro" : "crea registro"}
                        </span>
                      </div>
                      <TransparencyImportReviewActions applyOnly={!canApply} jobId={importJob.id} stagingId={item.id} />
                    </header>
                    {sourceUrl ? (
                      <a className="source-link" href={String(sourceUrl)} rel="noreferrer" target="_blank">
                        Ver fuente oficial
                      </a>
                    ) : null}
                    <ComparisonTable current={current} proposed={proposed} />
                    <details>
                      <summary>Ver dato tecnico extraido</summary>
                      <pre>{shortJson(item.extracted_data)}</pre>
                    </details>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">No se han extraido datos estructurados en esta importacion.</div>
            )}
          </div>
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Fuentes localizadas</h2>
                <p>Paginas, documentos y enlaces clasificados por categoria.</p>
              </div>
              <FileText size={20} />
            </div>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {importSources.map((source) => (
                    <tr key={source.id}>
                      <td>
                        <a href={source.url} rel="noreferrer" target="_blank">
                          {source.title ?? source.url}
                        </a>
                      </td>
                      <td>{source.source_type}</td>
                      <td>{source.category}</td>
                      <td>{source.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Diferencias propuestas</h2>
                <p>Resumen de cambios pendientes, aprobados y aplicados.</p>
              </div>
              <GitCompareArrows size={20} />
            </div>
            <div className="status-list">
              {importDiffs.length ? (
                importDiffs.map((diff) => (
                  <div className="status-item" key={diff.id}>
                    <div>
                      <div className="status-title">{diff.target_table}</div>
                      <div className="status-meta">{diff.diff_summary ?? diff.change_type}</div>
                    </div>
                    <span className="badge blue">{diff.status}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">Aun no hay diferencias calculadas.</div>
              )}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Historial de cambios aplicados</h2>
              <p>Registro fechado de cambios de legislatura procedentes de esta importacion.</p>
            </div>
            <History size={20} />
          </div>
          <div className="status-list">
            {(changeLog ?? []).length ? (
              (changeLog ?? []).map((change) => (
                <div className="status-item" key={change.id as string}>
                  <div>
                    <div className="status-title">
                      {String(change.change_type)} · {String(change.target_table)}
                    </div>
                    <div className="status-meta">
                      Aplicado {formatDate(String(change.applied_at))} · efecto {String(change.effective_date)}
                    </div>
                  </div>
                  <span className="badge green">trazado</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Todavia no se han aplicado cambios desde esta importacion.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
