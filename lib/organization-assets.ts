import { appConfig } from "@/lib/config";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type OrganizationLogoSettings = {
  bucket?: unknown;
  path?: unknown;
  alt?: unknown;
  updatedAt?: unknown;
};

export type OrganizationBrandAsset = {
  logoUrl: string | null;
  logoAlt: string;
  fallbackText: string;
};

function logoSettings(settings: Record<string, unknown> | null | undefined): OrganizationLogoSettings {
  const logo = settings?.logo;
  return logo && typeof logo === "object" ? (logo as OrganizationLogoSettings) : {};
}

export async function getOrganizationBrandAsset(): Promise<OrganizationBrandAsset> {
  const fallbackText = "VOX Majadahonda";

  try {
    const adminClient = getSupabaseAdminClient();
    const { data: organization } = await adminClient
      .from("organizations")
      .select("name, municipality, settings")
      .eq("slug", appConfig.defaultOrgSlug)
      .single();

    if (!organization) {
      return {
        logoUrl: null,
        logoAlt: fallbackText,
        fallbackText
      };
    }

    const logo = logoSettings((organization.settings ?? {}) as Record<string, unknown>);
    const bucket = typeof logo.bucket === "string" ? logo.bucket : null;
    const path = typeof logo.path === "string" ? logo.path : null;
    const alt = typeof logo.alt === "string" ? logo.alt : organization.name ?? fallbackText;

    if (!bucket || !path) {
      return {
        logoUrl: null,
        logoAlt: alt,
        fallbackText: `VOX ${organization.municipality ?? "Majadahonda"}`
      };
    }

    const { data } = await adminClient.storage.from(bucket).createSignedUrl(path, 60 * 60);

    return {
      logoUrl: data?.signedUrl ?? null,
      logoAlt: alt,
      fallbackText: `VOX ${organization.municipality ?? "Majadahonda"}`
    };
  } catch {
    return {
      logoUrl: null,
      logoAlt: fallbackText,
      fallbackText
    };
  }
}
