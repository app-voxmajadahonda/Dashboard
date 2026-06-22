import { NextResponse } from "next/server";
import { getRequestOrganizationContextJson, requireRequestUserJson } from "@/lib/server/api-auth";
import { textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user, response } = await requireRequestUserJson();

  if (response || !user) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { context, response: contextResponse } = await getRequestOrganizationContextJson(user.id);

  if (contextResponse || !context) {
    return contextResponse ?? NextResponse.json({ error: "No existe una organización activa." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = textValue(formData, "title");
  const body = textValue(formData, "body");
  const scope = textValue(formData, "scope") || "dashboard_concejal";

  if (!title || title.length < 4) {
    return NextResponse.json({ error: "La observación necesita un título claro." }, { status: 400 });
  }

  const adminClient = getSupabaseAdminClient();
  const { error } = await adminClient.from("councillor_observations").insert({
    organization_id: context.organization.id,
    user_id: user.id,
    scope,
    title,
    body: body || null,
    visibility: "internal"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await adminClient.from("audit_log").insert({
    organization_id: context.organization.id,
    actor_user_id: user.id,
    action: "councillor_observation_created",
    target_table: "councillor_observations",
    metadata: {
      scope,
      title
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Observación guardada correctamente."
  });
}
