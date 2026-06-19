import { NextResponse } from "next/server";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type { DocumentKind } from "@/lib/types";

const allowedKinds = new Set<DocumentKind>([
  "fiscal_ordinance",
  "budget",
  "delegation_decree",
  "rom",
  "minutes",
  "agenda",
  "contract",
  "report",
  "other"
]);

const extractionSchemas: Record<string, string[]> = {
  fiscal_ordinance: [
    "nombre_ordenanza",
    "tipo_tributo",
    "hecho_imponible",
    "tarifas",
    "bonificaciones",
    "exenciones",
    "fecha_vigor",
    "articulos_clave"
  ],
  budget: ["ejercicio", "ingresos", "gastos", "areas", "partidas_relevantes", "modificaciones_credito"],
  delegation_decree: ["alcaldia", "tenencias_alcaldia", "concejalias", "competencias", "fechas"],
  rom: ["plenos", "comisiones", "convocatorias", "plazos", "derechos_informacion"]
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeFilename(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let context: Awaited<ReturnType<typeof requireOrganizationAdmin>>;
  try {
    context = await requireOrganizationAdmin(user.id);
  } catch {
    return NextResponse.json(
      { error: "Solo el portavoz o un administrador puede subir documentacion base." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const title = textValue(formData, "title");
  const kind = textValue(formData, "documentKind") as DocumentKind;
  const sourceName = textValue(formData, "sourceName");
  const sourceUrl = textValue(formData, "sourceUrl");
  const officialDate = textValue(formData, "officialDate");
  const file = formData.get("file");

  if (!title || !allowedKinds.has(kind) || !(file instanceof File)) {
    return NextResponse.json({ error: "Documento incompleto o tipo no permitido." }, { status: 400 });
  }

  const allowedMimeTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain"
  ]);

  if (file.type && !allowedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Solo se admiten PDF, DOCX, DOC y TXT para documentacion base." },
      { status: 400 }
    );
  }

  const adminClient = getSupabaseAdminClient();
  const { data: documentRow, error: documentError } = await adminClient
    .from("documents")
    .insert({
      organization_id: context.organization.id,
      kind,
      title,
      source_name: sourceName || "Carga manual",
      source_url: sourceUrl || null,
      official_date: officialDate || null,
      governing_body: context.organization.municipality,
      processing_status: "uploaded",
      created_by: user.id
    })
    .select("id")
    .single();

  if (documentError || !documentRow) {
    return NextResponse.json(
      { error: documentError?.message ?? "No se ha podido registrar el documento." },
      { status: 400 }
    );
  }

  const filename = safeFilename(file.name || `${kind}.pdf`);
  const storagePath = `${context.organization.id}/base-documents/${documentRow.id}/${filename}`;
  const { error: uploadError } = await adminClient.storage.from("documents").upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (uploadError) {
    await adminClient.from("documents").update({ processing_status: "failed" }).eq("id", documentRow.id);
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: fileError } = await adminClient.from("document_files").insert({
    document_id: documentRow.id,
    storage_bucket: "documents",
    storage_path: storagePath,
    mime_type: file.type || null,
    size_bytes: file.size,
    original_filename: file.name
  });

  if (fileError) {
    return NextResponse.json({ error: fileError.message }, { status: 400 });
  }

  const schemaFields = extractionSchemas[kind] ?? ["resumen", "datos_relevantes", "alertas"];
  await adminClient.from("document_extractions").insert({
    document_id: documentRow.id,
    summary: "Documento clasificado y pendiente de extraccion automatica.",
    structured_data: {
      documentKind: kind,
      extractionStatus: "pending_text_extraction",
      expectedFields: schemaFields,
      humanReviewRequired: true
    },
    model: "pending"
  });

  await adminClient.from("audit_log").insert({
    organization_id: context.organization.id,
    actor_user_id: user.id,
    action: "base_document_uploaded",
    target_table: "documents",
    target_id: documentRow.id,
    metadata: {
      kind,
      title,
      storagePath
    }
  });

  return NextResponse.json({
    ok: true,
    documentId: documentRow.id,
    message: "Documento guardado, clasificado y preparado para extraccion."
  });
}
