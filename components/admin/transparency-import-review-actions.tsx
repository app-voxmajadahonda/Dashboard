"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

async function submitReview(form: HTMLFormElement) {
  const response = await fetch("/api/admin/transparency-imports/review", {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido completar la acción.");
  }

  return payload?.message ?? "Acción completada.";
}

export function TransparencyImportReviewActions({
  applyOnly,
  jobId,
  stagingId
}: {
  applyOnly?: boolean;
  jobId: string;
  stagingId?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);

    try {
      setMessage(await submitReview(event.currentTarget));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se ha podido completar la acción.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="inline-admin-form" onSubmit={handleSubmit}>
      <input name="jobId" type="hidden" value={jobId} />
      {stagingId ? <input name="stagingId" type="hidden" value={stagingId} /> : null}
      {stagingId ? (
        <>
          {applyOnly ? null : (
            <>
              <button className="button primary" disabled={saving} name="action" type="submit" value="approve-staging">
                <CheckCircle2 size={16} />
                Aprobar
              </button>
              <button className="button" disabled={saving} name="action" type="submit" value="reject-staging">
                <XCircle size={16} />
                Rechazar
              </button>
            </>
          )}
          <button className={applyOnly ? "button primary" : "button"} disabled={saving} name="action" type="submit" value="apply-staging">
            <CheckCircle2 size={16} />
            Aplicar cambio
          </button>
        </>
      ) : (
        <>
          <button className="button" disabled={saving} name="action" type="submit" value="cancel-job">
            <XCircle size={16} />
            Cancelar importación
          </button>
          <button className="button primary" disabled={saving} name="action" type="submit" value="apply-approved">
            <CheckCircle2 size={16} />
            Aplicar aprobados
          </button>
        </>
      )}
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
    </form>
  );
}
