"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { appRoles } from "@/lib/auth/roles";

export function CreateUserForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      body: formData
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "No se ha podido crear el usuario.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Usuario creado y asignado correctamente.");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <label>
        Nombre completo
        <input name="fullName" placeholder="Nombre y apellidos" required />
      </label>
      <label>
        Email
        <input name="email" placeholder="usuario@dominio.es" required type="email" />
      </label>
      <label>
        Contrasena temporal
        <input
          minLength={8}
          name="password"
          placeholder="Minimo 8 caracteres"
          required
          type="password"
        />
      </label>
      <label>
        Rol
        <select name="role" required>
          {appRoles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </label>
      <button className="button primary" disabled={isSubmitting} type="submit">
        <UserPlus size={17} />
        {isSubmitting ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
