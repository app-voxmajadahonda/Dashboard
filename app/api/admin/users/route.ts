import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { appRoles } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const validRoles = new Set(appRoles.map((role) => role.value));

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Falta configuracion publica de Supabase." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {}
    }
  });

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as AppRole;

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
  const orgSlug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? "vox-majadahonda";

  const { data: organization, error: orgError } = await adminClient
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  if (orgError || !organization) {
    return NextResponse.json({ error: "No existe la organizacion configurada." }, { status: 500 });
  }

  const { data: currentMembership } = await adminClient
    .from("memberships")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .eq("active", true)
    .maybeSingle();

  if (!currentMembership) {
    return NextResponse.json({ error: "Solo un administrador puede crear usuarios." }, { status: 403 });
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
    organization_id: organization.id,
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
