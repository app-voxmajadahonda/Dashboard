"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

export function CouncillorObservationForm() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const form = event.currentTarget;
    const response = await fetch("/api/concejal/observations", {
      method: "POST",
      body: new FormData(form)
    });
    const payload = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "No se ha podido guardar la observación.");
      return;
    }

    form.reset();
    setStatus("saved");
    setMessage(payload.message ?? "Observación guardada correctamente.");
  }

  return (
    <form className="observation-form" onSubmit={handleSubmit}>
      <input name="scope" type="hidden" value="dashboard_concejal" />
      <div className="observation-form-title">
        <MessageSquarePlus size={18} />
        <div>
          <strong>Añadir observación interna</strong>
          <span>Quedará registrada para seguimiento del grupo municipal.</span>
        </div>
      </div>
      <label>
        Título
        <input maxLength={140} name="title" placeholder="Ej. Revisar dato de plantilla de Policía Local" required />
      </label>
      <label>
        Observación
        <textarea
          maxLength={1200}
          name="body"
          placeholder="Anota contexto, dudas, propuesta de actuación o información que deba revisar el portavoz."
          rows={4}
        />
      </label>
      <button className="button primary" disabled={status === "saving"} type="submit">
        {status === "saving" ? "Guardando..." : "Guardar observación"}
      </button>
      {message ? <p className={`form-status ${status}`}>{message}</p> : null}
    </form>
  );
}
