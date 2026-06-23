"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { CalendarPlus, CheckCircle2, FileUp, Save } from "lucide-react";

type LegislatureDocument = {
  id: string;
  document_role: string;
  status: string;
  extracted_data: Record<string, unknown>;
  reviewed_data: Record<string, unknown>;
};

async function submitForm(form: HTMLFormElement) {
  const response = await fetch("/api/admin/legislature", {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido guardar.");
  }

  return payload?.message ?? "Guardado correctamente.";
}

function useSubmitState() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);

    try {
      const nextMessage = await submitForm(event.currentTarget);
      setMessage(nextMessage);
      if (event.currentTarget.dataset.reset === "true") {
        event.currentTarget.reset();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se ha podido guardar.");
    } finally {
      setSaving(false);
    }
  }

  return { error, handleSubmit, message, saving };
}

function FormFeedback({ error, message }: { error: string | null; message: string | null }) {
  return (
    <>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
    </>
  );
}

export function CreateLegislatureForm() {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="create-legislature" />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        Nombre
        <input name="name" placeholder="2023-2027" required />
      </label>
      <label>
        Inicio
        <input name="startDate" required type="date" />
      </label>
      <label>
        Fin
        <input name="endDate" required type="date" />
      </label>
      <button className="button primary form-fit" disabled={state.saving} type="submit">
        <CalendarPlus size={17} />
        {state.saving ? "Creando..." : "Crear legislatura"}
      </button>
    </form>
  );
}

export function LegislatureDocumentUploadForm({ legislatureId }: { legislatureId: string | null }) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="upload-document" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        Tipo de documento
        <select disabled={!legislatureId} name="documentRole" required>
          <option value="organization_plenary">Pleno de Organización y Funcionamiento</option>
          <option value="delegation_decree">Decreto de delegaciones</option>
          <option value="committee_creation">Acuerdo de creación de comisiones</option>
          <option value="municipal_group_composition">Composición del Pleno / Grupo Municipal</option>
          <option value="municipal_rom">ROM municipal</option>
          <option value="other">Otro</option>
        </select>
      </label>
      <label>
        Título
        <input disabled={!legislatureId} name="title" required />
      </label>
      <label>
        Documento
        <input accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain" disabled={!legislatureId} name="file" required type="file" />
      </label>
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <FileUp size={17} />
        {state.saving ? "Subiendo..." : "Subir documento"}
      </button>
    </form>
  );
}

export function ReviewLegislatureDocumentForm({ document }: { document: LegislatureDocument }) {
  const state = useSubmitState();
  const defaultJson = JSON.stringify(
    Object.keys(document.reviewed_data ?? {}).length ? document.reviewed_data : document.extracted_data,
    null,
    2
  );

  return (
    <form className="admin-form legislature-review-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-review" />
      <input name="legislatureDocumentId" type="hidden" value={document.id} />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        Datos revisados
        <textarea defaultValue={defaultJson} name="reviewedData" rows={9} />
      </label>
      <div className="form-actions-row">
        <button className="button primary" disabled={state.saving} type="submit">
          <Save size={17} />
          Guardar revisión
        </button>
      </div>
    </form>
  );
}

export function ValidateLegislatureDocumentForm({ documentId }: { documentId: string }) {
  const state = useSubmitState();

  return (
    <form className="inline-admin-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="validate-document" />
      <input name="legislatureDocumentId" type="hidden" value={documentId} />
      <button className="button" disabled={state.saving} type="submit">
        <CheckCircle2 size={16} />
        Validar documento
      </button>
      <FormFeedback error={state.error} message={state.message} />
    </form>
  );
}

export function ValidateLegislatureForm({ legislatureId }: { legislatureId: string | null }) {
  const state = useSubmitState();

  return (
    <form className="inline-admin-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="validate-legislature" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <button className="button primary" disabled={!legislatureId || state.saving} type="submit">
        <CheckCircle2 size={16} />
        Activar legislatura
      </button>
      <FormFeedback error={state.error} message={state.message} />
    </form>
  );
}

export function GenerateCalendarForm({ legislatureId }: { legislatureId: string | null }) {
  const state = useSubmitState();

  return (
    <form className="inline-admin-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="generate-calendar" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <button className="button" disabled={!legislatureId || state.saving} type="submit">
        <CalendarPlus size={16} />
        Generar calendario base
      </button>
      <FormFeedback error={state.error} message={state.message} />
    </form>
  );
}

export function PlenaryScheduleForm({ legislatureId }: { legislatureId: string | null }) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-plenary-schedule" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        Regla ordinaria
        <input
          disabled={!legislatureId}
          name="ruleDescription"
          placeholder="Pleno ordinario mensual, tercer martes de cada mes"
          required
        />
      </label>
      <label>
        Frecuencia
        <input disabled={!legislatureId} name="frequency" placeholder="mensual" />
      </label>
      <label>
        Dia de la semana
        <input disabled={!legislatureId} name="weekday" placeholder="martes" />
      </label>
      <label>
        Semana del mes
        <input disabled={!legislatureId} max="5" min="1" name="weekOfMonth" placeholder="3" type="number" />
      </label>
      <label>
        Hora
        <input disabled={!legislatureId} name="time" type="time" />
      </label>
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        {state.saving ? "Guardando..." : "Guardar regla"}
      </button>
    </form>
  );
}
