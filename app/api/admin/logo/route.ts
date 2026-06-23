import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { safeFilename } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const allowedLogoTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Debes seleccionar un archivo de logo." }, { status: 400 });
  }

  if (file.type && !allowedLogoTypes.has(file.type)) {
    return NextResponse.json({ error: "El logo debe ser PNG, JPG, WEBP o SVG." }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "El logo no debe superar 2 MB." }, { status: 400 });
  }

  const adminClient = getSupabaseAdminClient();
  const filename = safeFilename(file.name || "logo.png");
  const storagePath = `${context.organization.id}/assets/logo-${Date.now()}-${filename}`;
  const bucket = "documents";

  const { error: uploadError } = await adminClient.storage.from(bucket).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const currentSettings = (context.organization.settings ?? {}) as Record<string, unknown>;
  const { error } = await adminClient
    .from("organizations")
    .update({
      settings: {
        ...currentSettings,
        logo: {
          bucket,
          path: storagePath,
          alt: context.organization.name,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        }
      }
    })
    .eq("id", context.organization.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await adminClient.from("audit_log").insert({
    organization_id: context.organization.id,
    actor_user_id: user.id,
    action: "organization_logo_uploaded",
    target_table: "organizations",
    target_id: context.organization.id,
    metadata: {
      bucket,
      storagePath,
      filename: file.name
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Logo actualizado correctamente."
  });
}
