import { ShieldCheck, Users } from "lucide-react";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { appRoles } from "@/lib/auth/roles";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireUser();

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={16} />
            Administración
          </span>
          <h1>Usuarios y roles</h1>
          <p>
            Alta de usuarios internos y asignación inicial de permisos para la
            organización configurada.
          </p>
        </div>
        <a className="button" href="/dashboard">
          Volver al dashboard
        </a>
      </header>

      <section className="admin-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Crear usuario</h2>
              <p>Solo los administradores podrán usar esta acción.</p>
            </div>
            <Users size={20} />
          </div>
          <CreateUserForm />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Roles disponibles</h2>
              <p>Base de permisos inicial del sistema.</p>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="status-list">
            {appRoles.map((role) => (
              <div className="status-item" key={role.value}>
                <div>
                  <div className="status-title">{role.label}</div>
                  <div className="status-meta">{role.description}</div>
                </div>
                <span className="badge blue">{role.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
