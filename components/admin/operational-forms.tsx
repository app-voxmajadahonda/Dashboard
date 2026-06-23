"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, CalendarPlus, CheckCircle2 } from "lucide-react";

type TeamMember = {
  id: string;
  label: string;
  role: string;
};

type FormState = {
  message: string | null;
  error: string | null;
  saving: boolean;
};

const initialState: FormState = {
  message: null,
  error: null,
  saving: false
};

async function submitOperationalForm(form: HTMLFormElement) {
  const response = await fetch("/api/admin/operational", {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido guardar.");
  }

  return payload?.message ?? "Guardado correctamente.";
}

function AssigneeSelect({ team }: { team: TeamMember[] }) {
  return (
    <label>
      Responsable
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

function PrioritySelect() {
  return (
    <label>
      Prioridad
      <select defaultValue="medium" name="priority">
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="critical">Critica</option>
      </select>
    </label>
  );
}

function RelatedFields() {
  return (
    <>
      <label>
        Entidad relacionada
        <input name="relatedEntityType" placeholder="Ej. plenary_sessions, motions, tasks..." />
      </label>
      <label>
        ID entidad relacionada
        <input name="relatedEntityId" placeholder="UUID opcional" />
      </label>
    </>
  );
}

function OperationalFormShell({
  action,
  children,
  icon,
  title,
  description
}: {
  action: "alert" | "task" | "calendar_event";
  children: ReactNode;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const [state, setState] = useState<FormState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ message: null, error: null, saving: true });

    try {
      const message = await submitOperationalForm(event.currentTarget);
      event.currentTarget.reset();
      setState({ message, error: null, saving: false });
    } catch (error) {
      setState({
        message: null,
        error: error instanceof Error ? error.message : "No se ha podido guardar.",
        saving: false
      });
    }
  }

  return (
    <form className="admin-form operational-form" onSubmit={handleSubmit}>
      <div className="operational-form-title">
        {icon}
        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
      </div>
      {state.message ? <div className="form-success">{state.message}</div> : null}
      {state.error ? <div className="form-error">{state.error}</div> : null}
      <input name="action" type="hidden" value={action} />
      {children}
      <button className="button primary form-fit" disabled={state.saving} type="submit">
        {state.saving ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export function OperationalForms({ team }: { team: TeamMember[] }) {
  return (
    <div className="operational-forms-grid">
      <OperationalFormShell
        action="alert"
        description="Para riesgos, vencimientos, datos caducados o asuntos politicos urgentes."
        icon={<AlertTriangle size={19} />}
        title="Crear alerta"
      >
        <label>
          Titulo
          <input maxLength={160} name="title" required />
        </label>
        <label>
          Descripcion
          <textarea name="description" rows={3} />
        </label>
        <PrioritySelect />
        <label>
          Fecha limite
          <input name="dueAt" type="datetime-local" />
        </label>
        <AssigneeSelect team={team} />
        <label>
          Categoria
          <input defaultValue="manual" name="category" />
        </label>
        <label>
          Accion recomendada
          <textarea name="recommendedAction" rows={2} />
        </label>
        <RelatedFields />
      </OperationalFormShell>

      <OperationalFormShell
        action="task"
        description="Para asignar trabajo concreto a un concejal, asesor o responsable."
        icon={<CheckCircle2 size={19} />}
        title="Crear tarea"
      >
        <label>
          Titulo
          <input maxLength={160} name="title" required />
        </label>
        <label>
          Descripcion
          <textarea name="description" rows={3} />
        </label>
        <PrioritySelect />
        <AssigneeSelect team={team} />
        <label>
          Fecha limite
          <input name="dueAt" type="datetime-local" />
        </label>
        <RelatedFields />
      </OperationalFormShell>

      <OperationalFormShell
        action="calendar_event"
        description="Para plenos, comisiones, juntas, reuniones, actos y plazos."
        icon={<CalendarPlus size={19} />}
        title="Crear evento"
      >
        <label>
          Titulo
          <input maxLength={160} name="title" required />
        </label>
        <label>
          Tipo
          <select defaultValue="otro" name="eventType">
            <option value="pleno">Pleno</option>
            <option value="comision">Comision</option>
            <option value="junta_portavoces">Junta de Portavoces</option>
            <option value="consejo">Consejo</option>
            <option value="reunion">Reunion</option>
            <option value="acto">Acto</option>
            <option value="plazo">Plazo</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label>
          Inicio
          <input name="startsAt" required type="datetime-local" />
        </label>
        <label>
          Fin
          <input name="endsAt" type="datetime-local" />
        </label>
        <label>
          Lugar
          <input name="location" />
        </label>
        <label>
          Descripcion
          <textarea name="description" rows={3} />
        </label>
        <RelatedFields />
      </OperationalFormShell>
    </div>
  );
}
