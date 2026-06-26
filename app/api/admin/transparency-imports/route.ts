import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { safeFilename, textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  DocumentKind,
  TransparencyImportCategory,
  TransparencyImportEntityType,
  TransparencyImportSourceType
} from "@/lib/types";

const MAX_DEPTH = 3;
const MAX_URLS = 80;
const MAX_DOCUMENTS = 20;
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
const USER_AGENT = "VOX-Majadahonda-Dashboard/1.0 transparency-import";

function normalizeUrl(rawUrl: string, baseUrl: string) {
  try {
    const url = new URL(rawUrl, baseUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function sourceTypeFor(url: string, contentType?: string | null): TransparencyImportSourceType {
  const lower = url.toLowerCase();
  const type = contentType?.toLowerCase() ?? "";

  if (lower.includes("videoacta")) return "videoacta";
  if (lower.endsWith(".pdf") || type.includes("pdf")) return "pdf";
  if (lower.endsWith(".docx") || lower.endsWith(".doc") || type.includes("word")) return "docx";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || type.includes("spreadsheet")) return "xlsx";
  if (type.includes("text/html") || !type) return "page";
  return "unknown";
}

function categoryFor(url: string, title = ""): TransparencyImportCategory {
  const text = `${url} ${title}`.toLowerCase();

  if (text.includes("videoacta") || text.includes("video-acta")) return "videoactas";
  if (text.includes("mocion") || text.includes("moción")) return "mociones";
  if (text.includes("acta")) return "actas";
  if (text.includes("convocatoria") || text.includes("orden-del-dia") || text.includes("orden del dia")) return "convocatorias";
  if (text.includes("comision") || text.includes("comisión")) return "comisiones";
  if (text.includes("junta-de-gobierno") || text.includes("junta de gobierno")) return "junta_gobierno";
  if (text.includes("grupo") || text.includes("legislatura")) return "grupos_municipales";
  if (text.includes("pleno")) return "pleno";
  if (text.includes("organigrama")) return "organigrama";
  if (text.includes("estructura") || text.includes("area") || text.includes("área") || text.includes("concejalias")) return "areas_gobierno";
  if (text.includes("decreto") || text.includes("delegacion") || text.includes("delegación")) return "delegaciones";
  return "otros";
}

function entityTypeFor(category: TransparencyImportCategory): TransparencyImportEntityType {
  const map: Partial<Record<TransparencyImportCategory, TransparencyImportEntityType>> = {
    pleno: "plenary_session",
    composicion_pleno: "municipal_corporation_member",
    grupos_municipales: "municipal_group",
    comisiones: "standing_committee",
    junta_gobierno: "government_board_member",
    areas_gobierno: "government_area",
    organigrama: "government_area",
    delegaciones: "delegated_councillor",
    convocatorias: "plenary_session",
    actas: "document_reference",
    mociones: "motion",
    videoactas: "video_minutes"
  };

  return map[category] ?? "document_reference";
}

function documentKindFor(category: TransparencyImportCategory): DocumentKind {
  if (category === "actas") return "minutes";
  if (category === "mociones") return "motion";
  if (category === "delegaciones") return "delegation_decree";
  if (category === "comisiones") return "committee";
  if (category === "convocatorias" || category === "pleno") return "agenda";
  if (category === "areas_gobierno" || category === "organigrama") return "report";
  return "other";
}

function extractTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  return title.replace(/\s+/g, " ").trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

function extractLinks(html: string, baseUrl: string) {
  const links = new Set<string>();
  const regex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const normalized = normalizeUrl(match[1], baseUrl);
    if (normalized) links.add(normalized);
  }

  return [...links];
}

async function audit(organizationId: string, userId: string, action: string, targetTable: string, targetId: string, metadata = {}) {
  await getSupabaseAdminClient().from("audit_log").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata
  });
}

async function createDocumentFromBytes({
  bytes,
  category,
  contentType,
  organizationId,
  title,
  url,
  userId
}: {
  bytes: ArrayBuffer;
  category: TransparencyImportCategory;
  contentType: string;
  organizationId: string;
  title: string;
  url: string;
  userId: string;
}) {
  const adminClient = getSupabaseAdminClient();
  const checksum = createHash("sha256").update(Buffer.from(bytes)).digest("hex");

  const { data: existingFile } = await adminClient
    .from("document_files")
    .select("document_id")
    .eq("checksum", checksum)
    .maybeSingle();

  if (existingFile?.document_id) {
    return { checksum, documentId: existingFile.document_id as string };
  }

  const { data: documentRow, error: documentError } = await adminClient
    .from("documents")
    .insert({
      organization_id: organizationId,
      kind: documentKindFor(category),
      title,
      source_name: "Portal de Transparencia de Majadahonda",
      source_url: url,
      governing_body: category,
      processing_status: "uploaded",
      created_by: userId
    })
    .select("id")
    .single();

  if (documentError || !documentRow) {
    throw new Error(documentError?.message ?? "No se ha podido registrar el documento localizado.");
  }

  const filename = safeFilename(new URL(url).pathname.split("/").pop() || `${documentRow.id}.pdf`);
  const storagePath = `${organizationId}/transparency-imports/${documentRow.id}/${filename}`;
  const { error: uploadError } = await adminClient.storage.from("documents").upload(storagePath, bytes, {
    contentType,
    upsert: false
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: fileError } = await adminClient.from("document_files").insert({
    document_id: documentRow.id,
    storage_bucket: "documents",
    storage_path: storagePath,
    mime_type: contentType,
    size_bytes: bytes.byteLength,
    original_filename: filename,
    checksum
  });

  if (fileError) {
    throw new Error(fileError.message);
  }

  await adminClient.from("document_extractions").insert({
    document_id: documentRow.id,
    summary: "Documento localizado desde el Portal de Transparencia. Pendiente de extraccion estructurada.",
    structured_data: {
      transparencyPortalImport: true,
      category,
      sourceUrl: url,
      humanReviewRequired: true
    },
    model: "pending"
  });

  return { checksum, documentId: documentRow.id as string };
}

async function runCrawler({
  jobId,
  legislatureId,
  mode,
  organizationId,
  processRunId,
  sourceUrl,
  userId
}: {
  jobId: string;
  legislatureId: string;
  mode: string;
  organizationId: string;
  processRunId: string;
  sourceUrl: string;
  userId: string;
}) {
  const adminClient = getSupabaseAdminClient();
  const allowedHost = new URL(sourceUrl).hostname;
  const queue: Array<{ url: string; depth: number }> = [{ url: sourceUrl, depth: 0 }];
  const visited = new Set<string>();
  const sourceRows: Array<Record<string, unknown>> = [];
  const stagingRows: Array<Record<string, unknown>> = [];
  let downloadedDocuments = 0;

  while (queue.length && visited.size < MAX_URLS) {
    const item = queue.shift();
    if (!item || visited.has(item.url) || item.depth > MAX_DEPTH) continue;
    visited.add(item.url);

    const url = new URL(item.url);
    if (url.hostname !== allowedHost) continue;

    try {
      const response = await fetch(item.url, {
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(8000)
      });
      const contentType = response.headers.get("content-type") ?? "";
      const sourceType = sourceTypeFor(item.url, contentType);

      if (sourceType === "page") {
        const html = await response.text();
        const title = extractTitle(html) || item.url;
        const category = categoryFor(item.url, title);
        const visibleText = stripHtml(html);
        const links = extractLinks(html, item.url);
        const source = {
          organization_id: organizationId,
          legislature_id: legislatureId,
          job_id: jobId,
          url: item.url,
          title,
          source_type: sourceType,
          category,
          status: "parsed"
        };
        sourceRows.push(source);

        if (category !== "otros") {
          stagingRows.push({
            organization_id: organizationId,
            legislature_id: legislatureId,
            job_id: jobId,
            entity_type: entityTypeFor(category),
            extracted_data: {
              title,
              url: item.url,
              category,
              sourceType,
              visibleText,
              links: links.slice(0, 30),
              extractionLevel: "basic_no_ai"
            },
            confidence: 0.45,
            status: "needs_review",
            matched_existing_table: null
          });
        }

        if (item.depth < MAX_DEPTH) {
          for (const link of links) {
            const normalized = normalizeUrl(link, item.url);
            if (normalized && new URL(normalized).hostname === allowedHost && !visited.has(normalized)) {
              queue.push({ url: normalized, depth: item.depth + 1 });
            }
          }
        }
      } else {
        const category = categoryFor(item.url);
        let documentId: string | null = null;
        let checksum: string | null = null;
        let status = "discovered";

        const length = Number(response.headers.get("content-length") ?? "0");
        const shouldDownload =
          mode !== "explore_only" &&
          downloadedDocuments < MAX_DOCUMENTS &&
          (!length || length <= MAX_DOCUMENT_BYTES) &&
          ["pdf", "docx", "xlsx"].includes(sourceType);

        if (shouldDownload) {
          const bytes = await response.arrayBuffer();
          if (bytes.byteLength <= MAX_DOCUMENT_BYTES) {
            const stored = await createDocumentFromBytes({
              bytes,
              category,
              contentType: contentType || "application/octet-stream",
              organizationId,
              title: item.url.split("/").pop() || item.url,
              url: item.url,
              userId
            });
            documentId = stored.documentId;
            checksum = stored.checksum;
            status = "downloaded";
            downloadedDocuments += 1;
          }
        }

        sourceRows.push({
          organization_id: organizationId,
          legislature_id: legislatureId,
          job_id: jobId,
          url: item.url,
          title: item.url.split("/").pop() || item.url,
          source_type: sourceType,
          category,
          status,
          document_id: documentId,
          checksum
        });

        if (category !== "otros") {
          stagingRows.push({
            organization_id: organizationId,
            legislature_id: legislatureId,
            job_id: jobId,
            entity_type: entityTypeFor(category),
            extracted_data: {
              title: item.url.split("/").pop() || item.url,
              url: item.url,
              category,
              sourceType,
              documentId,
              checksum,
              extractionLevel: "basic_metadata"
            },
            confidence: documentId ? 0.55 : 0.35,
            status: "needs_review"
          });
        }
      }
    } catch {
      sourceRows.push({
        organization_id: organizationId,
        legislature_id: legislatureId,
        job_id: jobId,
        url: item.url,
        title: item.url,
        source_type: "unknown",
        category: "otros",
        status: "failed",
        checksum: null
      });
    }
  }

  if (sourceRows.length) {
    await adminClient.from("transparency_import_sources").upsert(sourceRows, { onConflict: "job_id,url" });
  }

  let insertedStaging: Array<{ id: string; entity_type: string; extracted_data: Record<string, unknown> }> = [];
  if (stagingRows.length) {
    const { data, error } = await adminClient.from("transparency_import_staging").insert(stagingRows).select("id, entity_type, extracted_data");
    if (error) throw new Error(error.message);
    insertedStaging = (data ?? []) as typeof insertedStaging;
  }

  if (insertedStaging.length) {
    const diffs = insertedStaging.map((staging) => ({
      organization_id: organizationId,
      legislature_id: legislatureId,
      job_id: jobId,
      staging_id: staging.id,
      target_table: staging.entity_type,
      change_type: "conflict",
      current_data: {},
      proposed_data: staging.extracted_data,
      diff_summary: "Dato localizado por importador. Requiere revision humana antes de aplicar.",
      risk_level: "medium",
      status: "pending_review"
    }));
    await adminClient.from("transparency_import_diffs").insert(diffs);
  }

  await adminClient
    .from("transparency_import_jobs")
    .update({
      status: "needs_review",
      finished_at: new Date().toISOString(),
      metadata: {
        mode,
        visitedUrls: visited.size,
        sourcesDiscovered: sourceRows.length,
        stagingItems: insertedStaging.length,
        downloadedDocuments
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", jobId);

  await adminClient
    .from("process_runs")
    .update({
      status: "pending_review",
      metadata: {
        sourceUrl,
        mode,
        jobId,
        sourcesDiscovered: sourceRows.length,
        stagingItems: insertedStaging.length,
        downloadedDocuments
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", processRunId);

  await audit(organizationId, userId, "transparency_import_needs_review", "transparency_import_jobs", jobId, {
    sourcesDiscovered: sourceRows.length,
    stagingItems: insertedStaging.length,
    downloadedDocuments
  });
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const sourceUrl = textValue(formData, "sourceUrl") || "https://transparencia.majadahonda.org/";
  const legislatureId = textValue(formData, "legislatureId");
  const mode = textValue(formData, "mode") || "draft_import";
  const adminClient = getSupabaseAdminClient();

  try {
    if (!legislatureId) {
      return NextResponse.json({ error: "Falta la legislatura destino." }, { status: 400 });
    }

    const url = new URL(sourceUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json({ error: "La URL del portal debe empezar por http o https." }, { status: 400 });
    }

    const { data: activeLock } = await adminClient
      .from("system_locks")
      .select("id, expires_at, process_run_id")
      .eq("organization_id", context.organization.id)
      .eq("lock_type", "legislature_configuration")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (activeLock) {
      const { data: runningJob } = await adminClient
        .from("transparency_import_jobs")
        .select("id, status")
        .eq("organization_id", context.organization.id)
        .eq("process_run_id", activeLock.process_run_id)
        .in("status", ["pending", "crawling"])
        .maybeSingle();

      if (runningJob) {
        return NextResponse.json(
          { error: "Ya hay una importacion institucional en curso. Espera a que finalice o expire el bloqueo." },
          { status: 409 }
        );
      }

      await adminClient
        .from("system_locks")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", activeLock.id)
        .eq("organization_id", context.organization.id);
    }

    const { data: processRun, error: processError } = await adminClient
      .from("process_runs")
      .insert({
        organization_id: context.organization.id,
        process_type: "import_transparency_portal",
        title: "Importar desde Portal de Transparencia",
        status: "started",
        started_by: user.id,
        related_entity_type: "legislatures",
        related_entity_id: legislatureId,
        metadata: { sourceUrl, mode }
      })
      .select("id")
      .single();

    if (processError || !processRun) {
      throw new Error(processError?.message ?? "No se ha podido crear el proceso.");
    }

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    const { data: lock } = await adminClient
      .from("system_locks")
      .insert({
        organization_id: context.organization.id,
        lock_type: "legislature_configuration",
        reason: "transparency_portal_import",
        process_run_id: processRun.id,
        created_by: user.id,
        expires_at: expiresAt,
        status: "active"
      })
      .select("id")
      .single();

    const { data: job, error: jobError } = await adminClient
      .from("transparency_import_jobs")
      .insert({
        organization_id: context.organization.id,
        legislature_id: legislatureId,
        process_run_id: processRun.id,
        source_url: sourceUrl,
        status: "crawling",
        started_by: user.id,
        metadata: { mode, limits: { maxDepth: MAX_DEPTH, maxUrls: MAX_URLS, maxDocuments: MAX_DOCUMENTS } }
      })
      .select("id")
      .single();

    if (jobError || !job) {
      throw new Error(jobError?.message ?? "No se ha podido crear el job de importacion.");
    }

    await audit(context.organization.id, user.id, "transparency_import_started", "transparency_import_jobs", job.id, {
      sourceUrl,
      mode,
      processRunId: processRun.id,
      lockId: lock?.id ?? null
    });

    try {
      await runCrawler({
        jobId: job.id as string,
        legislatureId,
        mode,
        organizationId: context.organization.id,
        processRunId: processRun.id as string,
        sourceUrl,
        userId: user.id
      });
    } finally {
      await adminClient
        .from("system_locks")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("process_run_id", processRun.id)
        .eq("organization_id", context.organization.id);
      await audit(context.organization.id, user.id, "system_lock_released", "system_locks", lock?.id ?? processRun.id, {
        processRunId: processRun.id
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Importacion finalizada y pendiente de revision humana.",
      jobId: job.id,
      processRunId: processRun.id
    });
  } catch (error) {
    await adminClient.from("audit_log").insert({
      organization_id: context.organization.id,
      actor_user_id: user.id,
      action: "transparency_import_failed",
      target_table: "transparency_import_jobs",
      metadata: {
        sourceUrl,
        mode,
        error: error instanceof Error ? error.message : "Error desconocido"
      }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido importar el portal." },
      { status: 400 }
    );
  }
}
