import { NextResponse } from "next/server";
import { getRequestOrganizationContextJson, requireRequestUserJson } from "@/lib/server/api-auth";
import { listValue, textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user, response } = await requireRequestUserJson();

  if (response || !user) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const targetUserId = textValue(formData, "targetUserId") || user.id;
  const { context, response: contextResponse } = await getRequestOrganizationContextJson(user.id);
  const isPrivilegedRole = ["admin", "spokesperson"].includes(context?.membership.role ?? "");

  if (contextResponse || !context) {
    return contextResponse ?? NextResponse.json({ error: "No existe una organizacion activa." }, { status: 403 });
  }

  if (targetUserId !== user.id && !isPrivilegedRole) {
    return NextResponse.json({ error: "No puedes modificar la ficha de otro usuario." }, { status: 403 });
  }

  const adminClient = getSupabaseAdminClient();
  const socialLinks = {
    x: textValue(formData, "xUrl"),
    instagram: textValue(formData, "instagramUrl"),
    facebook: textValue(formData, "facebookUrl"),
    linkedin: textValue(formData, "linkedinUrl")
  };

  const { error } = await adminClient
    .from("profiles")
    .update({
      full_name: textValue(formData, "fullName"),
      phone: textValue(formData, "phone"),
      whatsapp: textValue(formData, "whatsapp"),
      position: textValue(formData, "position"),
      public_role: textValue(formData, "publicRole"),
      social_links: socialLinks,
      committees: listValue(textValue(formData, "committees")),
      responsibilities: listValue(textValue(formData, "responsibilities")),
      profile_settings: {
        notes: textValue(formData, "notes")
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Ficha actualizada correctamente."
  });
}
