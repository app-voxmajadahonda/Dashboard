import { Building2, KeyRound, ShieldCheck } from "lucide-react";

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

        <form className="login-form">
          <label>
            Email
            <input placeholder="usuario@dominio.es" type="email" />
          </label>
          <label>
            Contrasena
            <input placeholder="Introduce tu contrasena" type="password" />
          </label>
          <button className="button primary" type="button">
            <KeyRound size={17} />
            Entrar
          </button>
          <p className="muted">
            Esta pantalla quedara conectada a Supabase Auth cuando tengamos las
            credenciales del proyecto.
          </p>
        </form>
      </section>
    </main>
  );
}
