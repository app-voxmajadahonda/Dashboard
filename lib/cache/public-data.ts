import municipalProfile from "@/config/municipal-profile.json";
import { appConfig } from "@/lib/config";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { VoxPressPost } from "@/lib/vox/press";

type CacheRow = {
  cache_key: string;
  payload: unknown;
  expires_at: string | null;
};

type PublicDataCache = {
  pressPosts: VoxPressPost[];
  cacheStatus: {
    source: "database" | "fallback";
    staleKeys: string[];
  };
};

function isFresh(expiresAt: string | null) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() > Date.now();
}

function asPressPosts(payload: unknown): VoxPressPost[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const posts = (payload as { posts?: unknown }).posts;

  if (!Array.isArray(posts)) {
    return [];
  }

  return posts
    .map((post) => {
      if (!post || typeof post !== "object") {
        return null;
      }

      const title = (post as { title?: unknown }).title;
      const url = (post as { url?: unknown }).url;

      if (typeof title !== "string" || typeof url !== "string") {
        return null;
      }

      return { title, url };
    })
    .filter((post): post is VoxPressPost => post !== null);
}

export async function getPublicDataCache(): Promise<PublicDataCache> {
  try {
    const adminClient = getSupabaseAdminClient();
    const { data: organization } = await adminClient
      .from("organizations")
      .select("id")
      .eq("slug", appConfig.defaultOrgSlug)
      .single();

    if (!organization) {
      return {
        pressPosts: [],
        cacheStatus: { source: "fallback", staleKeys: ["organization"] }
      };
    }

    const { data: cacheRows } = await adminClient
      .from("cached_external_data")
      .select("cache_key, payload, expires_at")
      .eq("organization_id", organization.id)
      .in("cache_key", ["vox_press_posts", "public_profile"]);

    const rows = ((cacheRows ?? []) as CacheRow[]).reduce<Record<string, CacheRow>>((acc, row) => {
      acc[row.cache_key] = row;
      return acc;
    }, {});

    const staleKeys = Object.values(rows)
      .filter((row) => !isFresh(row.expires_at))
      .map((row) => row.cache_key);

    return {
      pressPosts: isFresh(rows.vox_press_posts?.expires_at ?? null)
        ? asPressPosts(rows.vox_press_posts.payload)
        : [],
      cacheStatus: {
        source: "database",
        staleKeys
      }
    };
  } catch {
    return {
      pressPosts: [],
      cacheStatus: {
        source: "fallback",
        staleKeys: ["database"]
      }
    };
  }
}

export function getFallbackPublicProfile() {
  return municipalProfile;
}
