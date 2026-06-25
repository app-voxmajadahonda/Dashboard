import { redirect } from "next/navigation";
import { BadgeCheck, UserRound, UsersRound } from "lucide-react";
import { AppBreadcrumbs } from "@/components/app/breadcrumbs";
import { PrivateTopNav } from "@/components/app/private-top-nav";
import { UserProfileForm } from "@/components/profile/user-profile-form";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { getSupabaseAdminClient, requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function roleLabel(role: string) {
  if (role === "spokesperson") {
    return "Usuario portavoz";
  }

  if (role === "admin") {
    return "Usuario administrador";
  }

  return "Usuario concejal";
}

function roleHome(role: string) {
  return ["admin", "spokesperson"].includes(role) ? "/dashboard" : "/concejal";
}

export default async function ProfilePage() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);

  if (!context) {
    redirect("/login");
  }

  const adminClient = getSupabaseAdminClient();
  const [{ data: profile }, { data: teamMemberships }] = await Promise.all([
    adminClient
      .from("profiles")
      .select(
        "id, full_name, email, phone, whatsapp, position, public_role, social_links, committees, responsibilities, profile_settings"
      )
      .eq("id", user.id)
      .single(),
    context.membership.role === "admin"
      ? adminClient
          .from("memberships")
          .select("role, profiles(id, full_name, email, position, public_role)")
          .eq("organization_id", context.organization.id)
          .eq("active", true)
      : Promise.resolve({ data: [] })
  ]);

  if (!profile) {
    redirect("/dashboard");
  }

  const teamRows = (teamMemberships ?? []) as unknown as {
    role: string;
    profiles:
      | {
          id: string;
          full_name: string | null;
          email: string | null;
          position: string | null;
          public_role: string | null;
        }
      | {
          id: string;
          full_name: string | null;
          email: string | null;
          position: string | null;
          public_role: string | null;
        }[]
      | null;
  }[];

  const team = teamRows
    .map((member) => ({
      role: member.role,
      profile: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
    }))
    .filter(
      (member): member is {
        role: string;
        profile: {
          id: string;
          full_name: string | null;
          email: string | null;
          position: string | null;
          public_role: string | null;
        };
      } => Boolean(member.profile)
    );

  return (
    <div className="private-shell">
      <PrivateTopNav />
      <main className="private-main">
        <header className="private-page-header">
          <div>
            <AppBreadcrumbs
              icon={<UserRound size={16} />}
              items={[{ href: roleHome(context.membership.role), label: roleLabel(context.membership.role) }, { label: "Mi ficha" }]}
            />
            <h1>Mi ficha</h1>
            <p>
              Datos personales, contacto, redes sociales, comisiones y responsabilidades de trabajo. Cada concejal puede
              editar su ficha; el portavoz/admin tendra acceso a la informacion del equipo.
            </p>
          </div>
          <div className="private-header-card">
            <BadgeCheck size={20} />
            <span>Rol actual</span>
            <strong>{context.membership.role}</strong>
          </div>
        </header>

        <section className="profile-layout">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Datos de usuario</h2>
                <p>Ficha operativa del usuario dentro del grupo municipal.</p>
              </div>
              <UserRound size={20} />
            </div>
            <UserProfileForm canEdit profile={profile} />
          </article>

          <aside className="panel">
            <div className="panel-header">
              <div>
                <h2>Equipo</h2>
                <p>Visible completo para portavoz/admin. Los concejales veran su propia ficha.</p>
              </div>
              <UsersRound size={20} />
            </div>
            <div className="team-list">
              {team.length ? (
                team.map((member) => (
                  <article className="team-card" key={member.profile.id}>
                    <strong>{member.profile.full_name || member.profile.email}</strong>
                    <span>{member.profile.public_role || member.profile.position || member.role}</span>
                    <small>{member.profile.email}</small>
                  </article>
                ))
              ) : (
                <div className="empty-state">La vista de equipo completa esta reservada al portavoz/admin.</div>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
