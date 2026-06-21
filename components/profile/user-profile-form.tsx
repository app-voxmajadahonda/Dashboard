"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Save, UserRound } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  position?: string | null;
  public_role?: string | null;
  social_links?: Record<string, unknown>;
  committees?: unknown;
  responsibilities?: unknown;
  profile_settings?: Record<string, unknown>;
};

function asLines(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
}

function getSocial(profile: Profile, key: string) {
  const value = profile.social_links?.[key];
  return typeof value === "string" ? value : "";
}

function getNote(profile: Profile) {
  const value = profile.profile_settings?.notes;
  return typeof value === "string" ? value : "";
}

export function UserProfileForm({ profile, canEdit }: { profile: Profile; canEdit: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/profile", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error ?? "No se ha podido guardar la ficha.");
      return;
    }

    setMessage(payload?.message ?? "Ficha actualizada correctamente.");
  }

  return (
    <form className="admin-form two-column-form" onSubmit={handleSubmit}>
      {message ? <div className="form-success form-wide">{message}</div> : null}
      {error ? <div className="form-error form-wide">{error}</div> : null}
      <input name="targetUserId" type="hidden" value={profile.id} />
      <label>
        Nombre completo
        <input defaultValue={profile.full_name ?? ""} disabled={!canEdit} name="fullName" required />
      </label>
      <label>
        Email
        <input defaultValue={profile.email ?? ""} disabled name="email" type="email" />
      </label>
      <label>
        Teléfono
        <input defaultValue={profile.phone ?? ""} disabled={!canEdit} name="phone" />
      </label>
      <label>
        WhatsApp
        <input defaultValue={profile.whatsapp ?? ""} disabled={!canEdit} name="whatsapp" />
      </label>
      <label>
        Cargo interno
        <input defaultValue={profile.position ?? ""} disabled={!canEdit} name="position" />
      </label>
      <label>
        Cargo público / responsabilidad
        <input defaultValue={profile.public_role ?? ""} disabled={!canEdit} name="publicRole" />
      </label>
      <label>
        X / Twitter
        <input defaultValue={getSocial(profile, "x")} disabled={!canEdit} name="xUrl" type="url" />
      </label>
      <label>
        Instagram
        <input defaultValue={getSocial(profile, "instagram")} disabled={!canEdit} name="instagramUrl" type="url" />
      </label>
      <label>
        Facebook
        <input defaultValue={getSocial(profile, "facebook")} disabled={!canEdit} name="facebookUrl" type="url" />
      </label>
      <label>
        LinkedIn
        <input defaultValue={getSocial(profile, "linkedin")} disabled={!canEdit} name="linkedinUrl" type="url" />
      </label>
      <label className="form-wide">
        Comisiones a las que pertenece
        <textarea
          defaultValue={asLines(profile.committees)}
          disabled={!canEdit}
          name="committees"
          placeholder="Una comisión por línea"
          rows={4}
        />
      </label>
      <label className="form-wide">
        Responsabilidades o áreas de seguimiento
        <textarea
          defaultValue={asLines(profile.responsibilities)}
          disabled={!canEdit}
          name="responsibilities"
          placeholder="Un área o responsabilidad por línea"
          rows={4}
        />
      </label>
      <label className="form-wide">
        Notas internas
        <textarea defaultValue={getNote(profile)} disabled={!canEdit} name="notes" rows={4} />
      </label>
      <button className="button primary form-fit" disabled={!canEdit || isSubmitting} type="submit">
        {canEdit ? <Save size={17} /> : <UserRound size={17} />}
        {isSubmitting ? "Guardando..." : "Guardar ficha"}
      </button>
    </form>
  );
}
