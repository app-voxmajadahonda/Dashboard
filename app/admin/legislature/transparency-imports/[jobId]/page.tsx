import { redirect } from "next/navigation";
import { ArrowLeft, DatabaseZap, FileText, GitCompareArrows, ListChecks } from "lucide-react";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { TransparencyImportReviewActions } from "@/components/admin/transparency-import-review-actions";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import type { TransparencyImportDiff, TransparencyImportJob, TransparencyImportSource, TransparencyImportStaging } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("es-ES") : "Sin fecha";
}

function shortJson(value: Record<string, unknown>) {
  const text = JSON.stringify(value, null, 2);
  return text.length > 700 ? `${text.slice(0, 700)}...` : text;
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
              Importación institucional
            </span>
            <h1>Revisión del Portal de Transparencia</h1>
            <p>{importJob.source_url}</p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Estado del job</h2>
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
                <div className="status-title">Datos pendientes de revisión</div>
                <div className="status-meta">Staging institucional no aplicado</div>
              </div>
              <span className="badge blue">{importStaging.filter((item) => item.status === "needs_review").length}</span>
            </div>
          </div>
        </section>

        <section className="private-dashboard-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Fuentes localizadas</h2>
                <p>Páginas, documentos y enlaces clasificados por categoría.</p>
              </div>
              <FileText size={20} />
            </div>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
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
                <p>Comparación básica, siempre pendiente de revisión humana.</p>
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
                <div className="empty-state">Aún no hay diferencias calculadas.</div>
              )}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Datos extraídos</h2>
              <p>Datos en staging. Aprobar no aplica cambios definitivos todavía.</p>
            </div>
            <ListChecks size={20} />
          </div>
          <div className="review-grid">
            {importStaging.length ? (
              importStaging.map((item) => (
                <article className="review-card" key={item.id}>
                  <header>
                    <div>
                      <strong>{item.entity_type}</strong>
                      <span>
                        {item.status} · confianza {item.confidence ?? "-"}
                      </span>
                    </div>
                    <TransparencyImportReviewActions jobId={importJob.id} stagingId={item.id} />
                  </header>
                  <div className="extraction-compare-grid">
                    <div>
                      <strong>Dato extraído</strong>
                      <pre>{shortJson(item.extracted_data)}</pre>
                    </div>
                    <div>
                      <strong>Coincidencia actual</strong>
                      <p>{item.matched_existing_table ?? "Sin coincidencia automática."}</p>
                    </div>
                    <div>
                      <strong>Revisión</strong>
                      <p>{item.review_notes ?? "Pendiente de criterio del portavoz/admin."}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">No se han extraído datos estructurados en esta importación.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
