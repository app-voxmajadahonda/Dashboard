"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsSubmitting(false);

    if (signInError) {
      setError("No se ha podido iniciar sesion con esas credenciales.");
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error ? <div className="form-error">{error}</div> : null}
      <label>
        Email
        <input
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="usuario@dominio.es"
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        Contrasena
        <input
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Introduce tu contrasena"
          required
          type="password"
          value={password}
        />
      </label>
      <button className="button primary" disabled={isSubmitting} type="submit">
        <KeyRound size={17} />
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
      <p className="muted">
        Acceso mediante usuario y contrasena. Los permisos se aplican por rol
        dentro de la organizacion.
      </p>
    </form>
  );
}
