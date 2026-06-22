import { NextRequest, NextResponse } from "next/server";
import { appRoles } from "@/lib/auth/roles";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { textValue } from "@/lib/server/form";
import type { AppRole } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const validRoles = new Set(appRoles.map((role) => role.value));

export async function POST(request: NextRequest) {
  const { context, response } = await requireAdminContextJson();

  if (response || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const fullName = textValue(formData, "fullName");
  const email = textValue(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = textValue(formData, "role") as AppRole;

  if (!fullName || !email || password.length < 8 || !validRoles.has(role)) {
    return NextResponse.json({ error: "Datos de usuario incompletos o no validos." }, { status: 400 });
  }

  let adminClient: ReturnType<typeof getSupabaseAdminClient>;
  try {
    adminClient = getSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el despliegue." },
      { status: 500 }
    );
  }

  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (createError || !createdUser.user) {
    return NextResponse.json(
      { error: createError?.message ?? "No se ha podido crear el usuario." },
      { status: 400 }
    );
  }

  const { error: membershipError } = await adminClient.from("memberships").insert({
    organization_id: context.organization.id,
    user_id: createdUser.user.id,
    role
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    userId: createdUser.user.id
  });
}
