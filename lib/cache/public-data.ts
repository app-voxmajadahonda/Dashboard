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
  publicEvents: {
    id: string;
    title: string;
    event_type: string;
    starts_at: string;
    status: string;
  }[];
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
        publicEvents: [],
        cacheStatus: { source: "fallback", staleKeys: ["organization"] }
      };
    }

    const [{ data: cacheRows }, { data: eventRows }] = await Promise.all([
      adminClient
        .from("cached_external_data")
        .select("cache_key, payload, expires_at")
        .eq("organization_id", organization.id)
        .in("cache_key", ["vox_press_posts", "public_profile"]),
      adminClient
        .from("calendar_events")
        .select("id, title, event_type, starts_at, status")
        .eq("organization_id", organization.id)
        .in("event_type", ["pleno", "comision", "junta_portavoces", "consejo"])
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5)
    ]);

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
      publicEvents: (eventRows ?? []) as PublicDataCache["publicEvents"],
      cacheStatus: {
        source: "database",
        staleKeys
      }
    };
  } catch {
    return {
      pressPosts: [],
      publicEvents: [],
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
