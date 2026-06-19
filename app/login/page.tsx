import { Building2, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <div className="brand-mark">GM</div>
          <h1>Acceso privado</h1>
          <p>
            Entrada al panel de seguimiento documental, accion de gobierno,
            mociones, comisiones y tareas del grupo municipal.
          </p>
          <div className="login-assurances">
            <span>
              <ShieldCheck size={17} />
              Roles por organizacion
            </span>
            <span>
              <Building2 size={17} />
              Configuracion multi-municipio
            </span>
          </div>
        </div>

        <Suspense fallback={<div className="login-form">Cargando acceso...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
