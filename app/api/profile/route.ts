import { NextResponse } from "next/server";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function listValue(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const targetUserId = textValue(formData, "targetUserId") || user.id;
  const context = await getOrganizationContextForUser(user.id);
  const isAdmin = context?.membership.role === "admin";

  if (targetUserId !== user.id && !isAdmin) {
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
