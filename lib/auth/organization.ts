import { appConfig } from "@/lib/config";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { AppRole, Organization } from "@/lib/types";

export type OrganizationContext = {
  organization: Organization & {
    municipal_website?: string | null;
    transparency_portal?: string | null;
    electronic_office?: string | null;
    settings?: Record<string, unknown>;
  };
  membership: {
    id: string;
    role: AppRole;
  };
};

export async function getOrganizationContextForUser(userId: string): Promise<OrganizationContext | null> {
  const adminClient = getSupabaseAdminClient();

  const { data: organization, error: organizationError } = await adminClient
    .from("organizations")
    .select(
      "id, slug, name, party, municipality, province, region, municipal_website, transparency_portal, electronic_office, settings"
    )
    .eq("slug", appConfig.defaultOrgSlug)
    .single();

  if (organizationError || !organization) {
    return null;
  }

  const { data: membership } = await adminClient
    .from("memberships")
    .select("id, role")
    .eq("organization_id", organization.id)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  return {
    organization: organization as OrganizationContext["organization"],
    membership: membership as OrganizationContext["membership"]
  };
}

export async function requireOrganizationAdmin(userId: string): Promise<OrganizationContext> {
  const context = await getOrganizationContextForUser(userId);

  if (!context || context.membership.role !== "admin") {
    throw new Error("ADMIN_REQUIRED");
  }

  return context;
}
