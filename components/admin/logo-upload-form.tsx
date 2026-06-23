"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ImageUp } from "lucide-react";

export function LogoUploadForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsUploading(true);

    const response = await fetch("/api/admin/logo", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

    setIsUploading(false);

    if (!response.ok) {
      setError(payload?.error ?? "No se ha podido subir el logo.");
      return;
    }

    event.currentTarget.reset();
    setMessage(payload?.message ?? "Logo actualizado correctamente.");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      <label>
        Logo del grupo municipal
        <input accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml" name="logo" required type="file" />
      </label>
      <button className="button primary form-fit" disabled={isUploading} type="submit">
        <ImageUp size={17} />
        {isUploading ? "Subiendo..." : "Subir logo"}
      </button>
    </form>
  );
}
