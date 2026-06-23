"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { FileUp, Landmark, UsersRound } from "lucide-react";

type TeamMember = {
  id: string;
  label: string;
  role: string;
};

async function submitGuidedProcess(form: HTMLFormElement) {
  const response = await fetch("/api/admin/guided-processes", {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido completar el proceso.");
  }

  return payload?.message ?? "Proceso completado.";
}

function ProcessFormShell({
  children,
  description,
  icon,
  processType,
  title
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  processType: "import_plenary_agenda" | "import_committee_call";
  title: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const nextMessage = await submitGuidedProcess(event.currentTarget);
      event.currentTarget.reset();
      setMessage(nextMessage);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se ha podido completar el proceso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="guided-process-card" onSubmit={handleSubmit}>
      <input name="processType" type="hidden" value={processType} />
      <div className="guided-process-title">
        {icon}
        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
      </div>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}
      {children}
      <button className="button primary form-fit" disabled={isSubmitting} type="submit">
        <FileUp size={17} />
        {isSubmitting ? "Importando..." : "Iniciar proceso"}
      </button>
    </form>
  );
}

function AssigneeSelect({ team }: { team: TeamMember[] }) {
  return (
    <label>
      Responsable inicial
      <select name="assignedTo">
        <option value="">Sin asignar</option>
        {team.map((member) => (
          <option key={member.id} value={member.id}>
            {member.label} ({member.role})
          </option>
        ))}
      </select>
    </label>
  );
}

function DocumentInput() {
  return (
    <label>
      Documento oficial
      <input accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain" name="file" required type="file" />
    </label>
  );
}

export function GuidedProcessForms({ team }: { team: TeamMember[] }) {
  return (
    <div className="guided-process-grid">
      <ProcessFormShell
        description="Sube el orden del dia y la app crea pleno, calendario, alerta y tareas base."
        icon={<Landmark size={20} />}
        processType="import_plenary_agenda"
        title="Importar orden del dia de Pleno"
      >
        <label>
          Titulo del pleno
          <input name="title" placeholder="Ej. Pleno ordinario de julio" required />
        </label>
        <label>
          Fecha y hora del pleno
          <input name="startsAt" required type="datetime-local" />
        </label>
        <label>
          Tipo de pleno
          <select defaultValue="ordinary" name="sessionType">
            <option value="ordinary">Ordinario</option>
            <option value="extraordinary">Extraordinario</option>
            <option value="urgent">Urgente</option>
          </select>
        </label>
        <AssigneeSelect team={team} />
        <DocumentInput />
      </ProcessFormShell>

      <ProcessFormShell
        description="Sube una convocatoria y la app crea comision, sesion, calendario, alerta y tareas base."
        icon={<UsersRound size={20} />}
        processType="import_committee_call"
        title="Importar convocatoria de comision"
      >
        <label>
          Nombre de la comision
          <input name="committeeName" placeholder="Ej. Hacienda" required />
        </label>
        <label>
          Titulo de la convocatoria
          <input name="title" placeholder="Ej. Comision de Hacienda de julio" required />
        </label>
        <label>
          Fecha y hora de la comision
          <input name="startsAt" required type="datetime-local" />
        </label>
        <AssigneeSelect team={team} />
        <DocumentInput />
      </ProcessFormShell>
    </div>
  );
}
