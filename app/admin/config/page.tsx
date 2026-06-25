import { redirect } from "next/navigation";
import { Settings, ShieldCheck } from "lucide-react";
import { ConfigurationForms } from "@/components/admin/configuration-forms";
import { LogoUploadForm } from "@/components/admin/logo-upload-form";
import { AppBreadcrumbs } from "@/components/app/breadcrumbs";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { requireOrganizationAdmin } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function roleLabel(role: string) {
  return role === "spokesperson" ? "Usuario portavoz" : "Usuario administrador";
}

export default async function AdminConfigPage() {
  const user = await requireUser();

  let context: Awaited<ReturnType<typeof requireOrganizationAdmin>>;
  try {
    context = await requireOrganizationAdmin(user.id);
  } catch {
    redirect("/concejal");
  }

  const adminClient = getSupabaseAdminClient();
  const [{ data: requirements }, { data: documents }, { data: dataSources }, { data: indicators }, { data: dataCatalog }] =
    await Promise.all([
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
        .limit(8),
      adminClient
        .from("data_catalog_items")
        .select(
          "id, data_key, display_name, dashboard_tab, dashboard_section, data_path, source_type, preferred_source, source_url, fallback_source, automation_level, refresh_interval_days, target_indicator_key, status"
        )
        .eq("organization_id", context.organization.id)
        .order("dashboard_tab", { ascending: true })
        .order("dashboard_section", { ascending: true })
        .order("display_name", { ascending: true })
    ]);

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header">
          <div>
            <AppBreadcrumbs
              icon={<ShieldCheck size={16} />}
              items={[{ href: "/dashboard", label: roleLabel(context.membership.role) }, { label: "Configuracion" }]}
            />
            <h1>Configuracion del municipio</h1>
            <p>
              Variables principales, fuentes oficiales, redes sociales y documentacion base que alimentara el analisis
              politico, institucional y presupuestario.
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
          dataCatalog={dataCatalog ?? []}
          dataSources={dataSources ?? []}
          indicators={indicators ?? []}
          organization={context.organization}
          requirements={requirements ?? []}
        />

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Identidad visual</h2>
              <p>Logo del grupo municipal para portada publica y barra privada.</p>
            </div>
            <Settings size={20} />
          </div>
          <LogoUploadForm />
        </section>
      </main>
    </div>
  );
}
