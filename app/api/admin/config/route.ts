import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { optionalUrl, textValue } from "@/lib/server/form";

export async function POST(request: NextRequest) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
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

  if (action === "data-sources") {
    const sourceCount = Number(textValue(formData, "sourceCount") || "0");
    const updates = Array.from({ length: sourceCount }, (_, index) => {
      const refreshIntervalDays = Number(textValue(formData, `refreshIntervalDays-${index}`) || "30");

      return {
        organization_id: context.organization.id,
        source_key: textValue(formData, `sourceKey-${index}`),
        label: textValue(formData, `label-${index}`),
        provider: textValue(formData, `provider-${index}`),
        source_url: optionalUrl(textValue(formData, `sourceUrl-${index}`)),
        refresh_interval_days: Number.isFinite(refreshIntervalDays) ? refreshIntervalDays : 30,
        enabled: formData.get(`enabled-${index}`) === "on",
        updated_at: new Date().toISOString()
      };
    }).filter((source) => source.source_key && source.label && source.provider);

    if (!updates.length) {
      return NextResponse.json({ error: "No hay fuentes de datos que actualizar." }, { status: 400 });
    }

    const { error } = await adminClient.from("data_sources").upsert(updates, {
      onConflict: "organization_id,source_key"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await adminClient.from("audit_log").insert({
      organization_id: context.organization.id,
      actor_user_id: user.id,
      action: "data_sources_updated",
      target_table: "data_sources",
      metadata: {
        sourceKeys: updates.map((source) => source.source_key)
      }
    });

    return NextResponse.json({ ok: true, message: "Fuentes de datos y caducidades actualizadas." });
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
