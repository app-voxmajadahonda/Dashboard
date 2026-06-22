import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getVoxPressPosts } from "@/lib/vox/press";

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export async function POST() {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const adminClient = getSupabaseAdminClient();
  const { data: sources } = await adminClient
    .from("data_sources")
    .select("source_key, provider, source_url, refresh_interval_days, enabled")
    .eq("organization_id", context.organization.id)
    .eq("enabled", true);

  const sourceRows = (sources ?? []) as {
    source_key: string;
    provider: string;
    source_url: string | null;
    refresh_interval_days: number;
    enabled: boolean;
  }[];

  const synced: string[] = [];
  const skipped: string[] = [];

  const voxSource = sourceRows.find((source) => source.source_key === "vox_press_posts");
  if (voxSource?.source_url) {
    const posts = await getVoxPressPosts(voxSource.source_url);
    const now = new Date().toISOString();
    const { error } = await adminClient.from("cached_external_data").upsert(
      {
        organization_id: context.organization.id,
        cache_key: "vox_press_posts",
        provider: voxSource.provider,
        source_url: voxSource.source_url,
        payload: {
          posts
        },
        fetched_at: now,
        expires_at: daysFromNow(voxSource.refresh_interval_days || 1),
        status: posts.length ? "fresh" : "empty",
        error_message: null,
        updated_at: now
      },
      {
        onConflict: "organization_id,cache_key"
      }
    );

    if (error) {
      skipped.push("vox_press_posts");
    } else {
      synced.push("vox_press_posts");
    }
  }

  const populationSource = sourceRows.find((source) => source.source_key === "population");
  if (populationSource) {
    skipped.push("population_pending_connector");
  }

  await adminClient.from("audit_log").insert({
    organization_id: context.organization.id,
    actor_user_id: user.id,
    action: "public_data_sync",
    target_table: "cached_external_data",
    metadata: {
      synced,
      skipped
    }
  });

  return NextResponse.json({
    ok: true,
    synced,
    skipped
  });
}
