import { NextRequest, NextResponse } from "next/server";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

export async function POST(request: NextRequest) {
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
      { error: "Solo el portavoz o un administrador puede cambiar la configuracion." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const action = textValue(formData, "action");
  const adminClient = getSupabaseAdminClient();
  const currentSettings = (context.organization.settings ?? {}) as Record<string, unknown>;

  if (action === "sources") {
    const nextSettings = {
      ...currentSettings,
      socialLinks: {
        x: optionalUrl(textValue(formData, "xUrl")),
        instagram: optionalUrl(textValue(formData, "instagramUrl")),
        facebook: optionalUrl(textValue(formData, "facebookUrl")),
        telegram: optionalUrl(textValue(formData, "telegramUrl"))
      },
      voxMunicipalUrl: optionalUrl(textValue(formData, "voxMunicipalUrl")),
      sourceNotes: textValue(formData, "sourceNotes")
    };

    const { error } = await adminClient
      .from("organizations")
      .update({
        municipal_website: optionalUrl(textValue(formData, "municipalWebsite")),
        transparency_portal: optionalUrl(textValue(formData, "transparencyPortal")),
        electronic_office: optionalUrl(textValue(formData, "electronicOffice")),
        settings: nextSettings
      })
      .eq("id", context.organization.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Configuracion actualizada." });
  }

  if (action === "municipality-change") {
    const nextMunicipality = textValue(formData, "nextMunicipality");
    const nextProvince = textValue(formData, "nextProvince");
    const confirmation = textValue(formData, "confirmation");

    if (!nextMunicipality || confirmation !== "CAMBIAR MUNICIPIO") {
      return NextResponse.json(
        { error: "Para abrir el cambio critico debes escribir CAMBIAR MUNICIPIO." },
        { status: 400 }
      );
    }

    const nextSettings = {
      ...currentSettings,
      pendingMunicipalityChange: {
        requestedAt: new Date().toISOString(),
        requestedBy: user.id,
        nextMunicipality,
        nextProvince,
        status: "requires_review",
        warning:
          "Este cambio no se aplica automaticamente. Abre un proceso de revision completa de municipio, fuentes, documentos y portada."
      }
    };

    const { error } = await adminClient
      .from("organizations")
      .update({ settings: nextSettings })
      .eq("id", context.organization.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await adminClient.from("audit_log").insert({
      organization_id: context.organization.id,
      actor_user_id: user.id,
      action: "municipality_change_requested",
      target_table: "organizations",
      target_id: context.organization.id,
      metadata: {
        nextMunicipality,
        nextProvince
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Cambio de municipio registrado como proceso pendiente de revision."
    });
  }

  return NextResponse.json({ error: "Accion de configuracion no reconocida." }, { status: 400 });
}
