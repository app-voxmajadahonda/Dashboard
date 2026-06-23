import { Settings, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import municipalProfile from "@/config/municipal-profile.json";
import { getOrganizationContextForUser } from "@/lib/auth/organization";
import { requireUser } from "@/lib/supabase/server";

export async function PrivateTopNav() {
  const user = await requireUser();
  const context = await getOrganizationContextForUser(user.id);
  const canConfigure = ["admin", "spokesperson"].includes(context?.membership.role ?? "");

  return (
    <header className="private-top-nav">
      <a className="private-brand" href={canConfigure ? "/dashboard" : "/concejal"}>
        <span className="brand-mark">VOX</span>
        <span>
          <strong>Portal Grupo Municipal</strong>
          <small>{municipalProfile.municipality.name}</small>
        </span>
      </a>

      <div className="private-session">
        <a className="button" href="/perfil">
          <UserRound size={17} />
          Mi ficha
        </a>
        {canConfigure ? (
          <a className="button" href="/admin/config">
            <Settings size={17} />
            Configuración
          </a>
        ) : null}
        <LogoutButton />
      </div>
    </header>
  );
}
