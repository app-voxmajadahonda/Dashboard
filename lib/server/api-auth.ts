import { NextResponse } from "next/server";
import { getOrganizationContextForUser, requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getRequestUser() {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  return user;
}

export async function requireRequestUserJson() {
  const user = await getRequestUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "No autenticado." }, { status: 401 })
    };
  }

  return {
    user,
    response: null
  };
}

export async function requireAdminContextJson() {
  const { user, response } = await requireRequestUserJson();

  if (!user) {
    return {
      user: null,
      context: null,
      response
    };
  }

  try {
    return {
      user,
      context: await requireOrganizationAdmin(user.id),
      response: null
    };
  } catch {
    return {
      user,
      context: null,
      response: NextResponse.json(
        { error: "Solo el portavoz o un administrador puede realizar esta accion." },
        { status: 403 }
      )
    };
  }
}

export async function getRequestOrganizationContextJson(userId: string) {
  const context = await getOrganizationContextForUser(userId);

  if (!context) {
    return {
      context: null,
      response: NextResponse.json({ error: "No existe una organizacion activa para este usuario." }, { status: 403 })
    };
  }

  return {
    context,
    response: null
  };
}
