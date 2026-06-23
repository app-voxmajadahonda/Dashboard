import { redirect } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import { ConfigurationForms } from "@/components/admin/configuration-forms";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const user = await requireUser();

  let context: Awaited<ReturnType<typeof requireOrganizationAdmin>>;
  try {
    context = await requireOrganizationAdmin(user.id);
  } catch {
    redirect("/concejal");
  }

  const adminClient = getSupabaseAdminClient();
  const [{ data: requirements }, { data: documents }, { data: dataSources }, { data: indicators }] = await Promise.all([
    adminClient
      .from("base_document_requirements")
      .select("id, title, description, document_kind, source_preference")
      .eq("organization_id", context.organization.id)
      .order("created_at", { ascending: true }),
    adminClient
      .from("documents")
      .select("id, title, kind, processing_status, created_at")
      .eq("organization_id", context.organization.id)
      .in("kind", [
        "fiscal_ordinance",
        "budget",
        "delegation_decree",
        "rom",
        "electoral_program",
        "strategic_plan",
        "communication_plan",
        "report"
      ])
      .order("created_at", { ascending: false })
      .limit(8),
    adminClient
      .from("data_sources")
      .select("id, source_key, label, provider, source_url, refresh_interval_days, enabled, updated_at")
      .eq("organization_id", context.organization.id)
      .order("label", { ascending: true }),
    adminClient
      .from("municipal_indicators")
      .select("id, label, source_key, data_status, updated_at, expires_at")
      .eq("organization_id", context.organization.id)
      .order("updated_at", { ascending: false })
      .limit(8)
  ]);

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header">
          <div>
            <span className="eyebrow">
              <ShieldCheck size={16} />
              Solo portavoz / administración
            </span>
            <h1>Configuración del municipio</h1>
            <p>
              Variables principales, fuentes oficiales, redes sociales y documentación base que
              alimentará el análisis político, institucional y presupuestario.
            </p>
          </div>
          <div className="private-header-card">
            <Settings size={20} />
            <span>{context.organization.name}</span>
            <strong>{context.organization.municipality}</strong>
          </div>
        </header>

        <ConfigurationForms
          documents={documents ?? []}
          dataSources={dataSources ?? []}
          indicators={indicators ?? []}
          organization={context.organization}
          requirements={requirements ?? []}
        />
      </main>
    </div>
  );
}
