"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { CalendarPlus, CheckCircle2, FileUp, Save, XCircle } from "lucide-react";
import type {
  CommitteeMembership,
  DelegatedCouncillor,
  GovernmentArea,
  MunicipalCorporationMember,
  MunicipalGroup,
  PlenaryRegularSchedule,
  StandingCommittee
} from "@/lib/types";

type LegislatureDocument = {
  id: string;
  document_role: string;
  status: string;
  extracted_data: Record<string, unknown>;
  reviewed_data: Record<string, unknown>;
};

type TransparencyImportJobSummary = {
  id: string;
  status: string;
  source_url: string;
  created_at: string;
  metadata: Record<string, unknown>;
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

async function submitTransparencyImport(form: HTMLFormElement) {
  const response = await fetch("/api/admin/transparency-imports", {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as { jobId?: string; message?: string; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido iniciar la importacion.");
  }

  return {
    jobId: payload?.jobId ?? null,
    message: payload?.message ?? "Importacion finalizada y pendiente de revision."
  };
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

function RecordSelect({ items, label }: { items: Array<{ id: string; name: string }>; label: string }) {
  return (
    <label>
      {label}
      <select name="recordId">
        <option value="">Crear nuevo registro</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            Editar: {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberSelect({
  members,
  name,
  required
}: {
  members: MunicipalCorporationMember[];
  name: string;
  required?: boolean;
}) {
  return (
    <select name={name} required={required}>
      <option value="">Sin asignar</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.full_name}
        </option>
      ))}
    </select>
  );
}

function CommitteeSelect({ committees, name, required }: { committees: StandingCommittee[]; name: string; required?: boolean }) {
  return (
    <select name={name} required={required}>
      <option value="">Seleccionar comisiÃ³n</option>
      {committees.map((committee) => (
        <option key={committee.id} value={committee.id}>
          {committee.name}
        </option>
      ))}
    </select>
  );
}

function AreaSelect({ areas, name }: { areas: GovernmentArea[]; name: string }) {
  return (
    <select name={name}>
      <option value="">Sin Ã¡rea</option>
      {areas.map((area) => (
        <option key={area.id} value={area.id}>
          {area.name}
        </option>
      ))}
    </select>
  );
}

function ActiveCheckbox() {
  return (
    <label className="checkbox-row">
      <input defaultChecked name="active" type="checkbox" />
      Activo
    </label>
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

export function TransparencyPortalImportForm({
  defaultUrl,
  disabled,
  job,
  legislatureId
}: {
  defaultUrl: string;
  disabled: boolean;
  job: TransparencyImportJobSummary | null;
  legislatureId: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [pendingForm, setPendingForm] = useState<HTMLFormElement | null>(null);
  const [progressStep, setProgressStep] = useState("Preparado para escanear el portal.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingForm(event.currentTarget);
    setConfirming(true);
  }

  async function runImport() {
    if (!pendingForm) return;

    setConfirming(false);
    setMessage(null);
    setError(null);
    setCompletedJobId(null);
    setSaving(true);
    setProgressStep("Conectando con el portal de transparencia...");

    const progressTimer = window.setInterval(() => {
      setProgressStep((current) => {
        if (current.includes("Conectando")) return "Localizando paginas institucionales y documentos.";
        if (current.includes("Localizando")) return "Clasificando fuentes de legislatura, grupos, areas y comisiones.";
        if (current.includes("Clasificando")) return "Preparando resumen para revision del portavoz.";
        return current;
      });
    }, 2200);

    try {
      const result = await submitTransparencyImport(pendingForm);
      setCompletedJobId(result.jobId);
      setProgressStep("Escaneo finalizado. Revisa el resumen antes de importar datos definitivos.");
      setMessage(result.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se ha podido iniciar la importacion.");
    } finally {
      window.clearInterval(progressTimer);
      setSaving(false);
    }
  }

  const sourcesDiscovered =
    typeof job?.metadata?.sourcesDiscovered === "number" ? job.metadata.sourcesDiscovered : null;
  const stagingItems = typeof job?.metadata?.stagingItems === "number" ? job.metadata.stagingItems : null;
  const downloadedDocuments =
    typeof job?.metadata?.downloadedDocuments === "number" ? job.metadata.downloadedDocuments : null;
  const missingLegislature = !legislatureId;

  return (
    <form className="admin-form transparency-import-form" onSubmit={handleSubmit}>
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <input name="mode" type="hidden" value="draft_import" />
      <FormFeedback error={error} message={message} />
      <div className="critical-warning form-wide">
        Este proceso revisa el Portal de Transparencia para detectar legislatura, Pleno, grupos, concejales, areas,
        delegaciones, comisiones, calendario, actas, mociones y documentos. El resultado se revisa antes de consolidarlo.
      </div>
      {disabled ? (
        <div className="form-error form-wide">
          Hay una importacion anterior marcada como activa. Puedes intentar iniciar una nueva; si la anterior ya termino,
          el sistema liberara el bloqueo automaticamente.
        </div>
      ) : null}
      {missingLegislature ? (
        <div className="form-error form-wide">Primero debe existir una legislatura activa o registrada.</div>
      ) : null}
      <label>
        URL del portal de transparencia
        <input defaultValue={defaultUrl} disabled={missingLegislature || saving} name="sourceUrl" required type="url" />
      </label>
      <button className="button primary form-fit" disabled={missingLegislature || saving} type="submit">
        <FileUp size={17} />
        {saving ? "Escaneando..." : "Iniciar importacion"}
      </button>
      {saving ? (
        <div className="transparency-progress form-wide">
          <div>
            <strong>{progressStep}</strong>
            <span>El proceso puede tardar unos segundos mientras revisa paginas y documentos del portal.</span>
          </div>
          <i>
            <span />
          </i>
        </div>
      ) : null}
      {job ? (
        <div className="status-list form-wide">
          <div className="status-item">
            <div>
              <div className="status-title">Ultima importacion</div>
              <div className="status-meta">
                {job.status} · fuentes {sourcesDiscovered ?? "-"} · documentos {downloadedDocuments ?? "-"} · datos {stagingItems ?? "-"}
              </div>
            </div>
            <a className="button" href={`/admin/legislature/transparency-imports/${job.id}`}>
              Ir a revision
            </a>
          </div>
        </div>
      ) : null}
      {confirming ? (
        <div className="import-flow-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-import-title">
          <article className="import-flow-card">
            <h3 id="confirm-import-title">Confirmar escaneo del portal</h3>
            <p>
              Se va a revisar la URL indicada para localizar datos de legislatura, composicion del Pleno, grupos,
              comisiones, areas y documentos institucionales. Nada se consolidara sin revision posterior.
            </p>
            <div className="form-actions-row">
              <button className="button primary" onClick={runImport} type="button">
                Continuar
              </button>
              <button className="button" onClick={() => setConfirming(false)} type="button">
                Cancelar
              </button>
            </div>
          </article>
        </div>
      ) : null}
      {completedJobId ? (
        <div className="import-flow-modal" role="dialog" aria-modal="true" aria-labelledby="completed-import-title">
          <article className="import-flow-card">
            <h3 id="completed-import-title">Escaneo finalizado</h3>
            <p>
              El portal ha sido revisado y se ha preparado un resumen con fuentes, documentos y datos detectados. El
              siguiente paso es revisar esos datos antes de volcarlos como informacion definitiva.
            </p>
            <div className="status-list">
              <div className="status-item">
                <div>
                  <div className="status-title">Resultado</div>
                  <div className="status-meta">{message ?? "Pendiente de revision humana."}</div>
                </div>
                <span className="badge green">Listo</span>
              </div>
            </div>
            <div className="form-actions-row">
              <a className="button primary" href={`/admin/legislature/transparency-imports/${completedJobId}`}>
                Revisar datos extraidos
              </a>
              <button className="button" onClick={() => setCompletedJobId(null)} type="button">
                Cerrar
              </button>
            </div>
          </article>
        </div>
      ) : null}
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
          <option value="organization_plenary">Pleno de OrganizaciÃ³n y Funcionamiento</option>
          <option value="delegation_decree">Decreto de delegaciones</option>
          <option value="committee_creation">Acuerdo de creaciÃ³n de comisiones</option>
          <option value="municipal_group_composition">ComposiciÃ³n del Pleno / Grupo Municipal</option>
          <option value="municipal_rom">ROM municipal</option>
          <option value="other">Otro</option>
        </select>
      </label>
      <label>
        TÃ­tulo
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
          Guardar revisiÃ³n
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

export function DiscardLegislatureDocumentForm({ documentId }: { documentId: string }) {
  const state = useSubmitState();

  return (
    <form className="inline-admin-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="discard-document" />
      <input name="legislatureDocumentId" type="hidden" value={documentId} />
      <button className="button" disabled={state.saving} type="submit">
        <XCircle size={16} />
        Descartar
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
    <form className="admin-form two-column-form" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="generate-calendar" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        Alcance
        <select disabled={!legislatureId} name="rangeMode">
          <option value="current_year">Solo aÃ±o actual</option>
          <option value="full_legislature">Toda la legislatura</option>
          <option value="custom">Rango personalizado</option>
        </select>
      </label>
      <label>
        Inicio personalizado
        <input disabled={!legislatureId} name="rangeStart" type="date" />
      </label>
      <label>
        Fin personalizado
        <input disabled={!legislatureId} name="rangeEnd" type="date" />
      </label>
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <CalendarPlus size={16} />
        Generar calendario base
      </button>
    </form>
  );
}

export function PlenaryScheduleForm({
  legislatureId,
  schedules = []
}: {
  legislatureId: string | null;
  schedules?: PlenaryRegularSchedule[];
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-plenary-schedule" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={schedules.map((item) => ({ id: item.id, name: item.rule_description }))} label="Registro" />
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
      <label>
        Excepciones
        <textarea disabled={!legislatureId} name="exceptions" placeholder="Agosto sin pleno&#10;Festivos locales" rows={3} />
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        {state.saving ? "Guardando..." : "Guardar regla"}
      </button>
    </form>
  );
}

export function CorporationMemberForm({
  legislatureId,
  members
}: {
  legislatureId: string | null;
  members: MunicipalCorporationMember[];
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-corporation-member" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={members.map((item) => ({ id: item.id, name: item.full_name }))} label="Registro" />
      <label>
        Nombre del concejal
        <input disabled={!legislatureId} name="fullName" required />
      </label>
      <label>
        Grupo polÃ­tico
        <input disabled={!legislatureId} name="politicalGroup" />
      </label>
      <label>
        Partido
        <input disabled={!legislatureId} name="party" />
      </label>
      <label>
        Cargo
        <input disabled={!legislatureId} name="role" />
      </label>
      <label>
        Orden
        <input disabled={!legislatureId} name="orderNumber" type="number" />
      </label>
      <label>
        Inicio
        <input disabled={!legislatureId} name="startDate" type="date" />
      </label>
      <label>
        Fin
        <input disabled={!legislatureId} name="endDate" type="date" />
      </label>
      <label className="checkbox-row">
        <input name="isMayor" type="checkbox" />
        Es alcalde
      </label>
      <label className="checkbox-row">
        <input name="isGovernmentMember" type="checkbox" />
        Forma parte del gobierno
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar concejal
      </button>
    </form>
  );
}

export function MunicipalGroupForm({ groups, legislatureId }: { groups: MunicipalGroup[]; legislatureId: string | null }) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-municipal-group" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={groups.map((item) => ({ id: item.id, name: item.name }))} label="Registro" />
      <label>
        Nombre del grupo
        <input disabled={!legislatureId} name="name" required />
      </label>
      <label>
        Partido
        <input disabled={!legislatureId} name="party" />
      </label>
      <label>
        Portavoz
        <input disabled={!legislatureId} name="spokespersonName" />
      </label>
      <label>
        Portavoz adjunto
        <input disabled={!legislatureId} name="deputySpokespersonName" />
      </label>
      <label>
        NÃºmero de concejales
        <input disabled={!legislatureId} name="councillorsCount" type="number" />
      </label>
      <label>
        Votos
        <input disabled={!legislatureId} name="votes" type="number" />
      </label>
      <label>
        Porcentaje de voto
        <input disabled={!legislatureId} name="votePercentage" step="0.01" type="number" />
      </label>
      <label>
        EscaÃ±os
        <input disabled={!legislatureId} name="seats" type="number" />
      </label>
      <label>
        Notas
        <textarea disabled={!legislatureId} name="notes" rows={3} />
      </label>
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar grupo
      </button>
    </form>
  );
}

export function GovernmentAreaForm({
  areas,
  legislatureId,
  members
}: {
  areas: GovernmentArea[];
  legislatureId: string | null;
  members: MunicipalCorporationMember[];
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-government-area" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={areas.map((item) => ({ id: item.id, name: item.name }))} label="Registro" />
      <label>
        Nombre del Ã¡rea
        <input disabled={!legislatureId} name="name" required />
      </label>
      <label>
        Concejal delegado
        <MemberSelect members={members} name="delegatedCouncillorId" />
      </label>
      <label>
        DescripciÃ³n
        <textarea disabled={!legislatureId} name="description" rows={3} />
      </label>
      <label>
        Competencias
        <textarea disabled={!legislatureId} name="competencies" placeholder="Una competencia por lÃ­nea" rows={4} />
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar Ã¡rea
      </button>
    </form>
  );
}

export function DelegationForm({
  areas,
  delegations,
  legislatureId,
  members
}: {
  areas: GovernmentArea[];
  delegations: DelegatedCouncillor[];
  legislatureId: string | null;
  members: MunicipalCorporationMember[];
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-delegation" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={delegations.map((item) => ({ id: item.id, name: item.delegation_title }))} label="Registro" />
      <label>
        Concejal
        <MemberSelect members={members} name="councillorId" />
      </label>
      <label>
        Ãrea
        <AreaSelect areas={areas} name="areaId" />
      </label>
      <label>
        TÃ­tulo de delegaciÃ³n
        <input disabled={!legislatureId} name="delegationTitle" required />
      </label>
      <label>
        Referencia del decreto
        <input disabled={!legislatureId} name="decreeReference" />
      </label>
      <label>
        Inicio
        <input disabled={!legislatureId} name="startDate" type="date" />
      </label>
      <label>
        Fin
        <input disabled={!legislatureId} name="endDate" type="date" />
      </label>
      <label>
        Competencias
        <textarea disabled={!legislatureId} name="competencies" rows={4} />
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar delegaciÃ³n
      </button>
    </form>
  );
}

export function StandingCommitteeForm({
  committees,
  legislatureId
}: {
  committees: StandingCommittee[];
  legislatureId: string | null;
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-standing-committee" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={committees.map((item) => ({ id: item.id, name: item.name }))} label="Registro" />
      <label>
        Nombre
        <input disabled={!legislatureId} name="name" required />
      </label>
      <label>
        Tipo
        <select disabled={!legislatureId} name="committeeType">
          <option value="standing">Ordinaria</option>
          <option value="special">Especial</option>
          <option value="accounts">Cuentas</option>
          <option value="other">Otra</option>
        </select>
      </label>
      <label>
        DescripciÃ³n
        <textarea disabled={!legislatureId} name="description" rows={3} />
      </label>
      <label>
        Regla ordinaria
        <input disabled={!legislatureId} name="ordinaryScheduleRule" />
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar comisiÃ³n
      </button>
    </form>
  );
}

export function CommitteeMembershipForm({
  committees,
  memberships,
  legislatureId,
  members
}: {
  committees: StandingCommittee[];
  memberships: CommitteeMembership[];
  legislatureId: string | null;
  members: MunicipalCorporationMember[];
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-committee-membership" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <RecordSelect items={memberships.map((item) => ({ id: item.id, name: `${item.political_group ?? "Miembro"} ${item.role}` }))} label="Registro" />
      <label>
        ComisiÃ³n
        <CommitteeSelect committees={committees} name="committeeId" required />
      </label>
      <label>
        Concejal
        <MemberSelect members={members} name="councillorId" />
      </label>
      <label>
        Grupo polÃ­tico
        <input disabled={!legislatureId} name="politicalGroup" />
      </label>
      <label>
        Rol
        <select disabled={!legislatureId} name="membershipRole">
          <option value="chair">Presidente</option>
          <option value="vice_chair">Vicepresidente</option>
          <option value="member">Titular</option>
          <option value="substitute">Suplente</option>
        </select>
      </label>
      <label>
        Suplente de
        <select disabled={!legislatureId} name="substituteForId">
          <option value="">No aplica</option>
          {memberships.map((membership) => (
            <option key={membership.id} value={membership.id}>
              {membership.political_group ?? membership.role}
            </option>
          ))}
        </select>
      </label>
      <label>
        Inicio
        <input disabled={!legislatureId} name="startDate" type="date" />
      </label>
      <label>
        Fin
        <input disabled={!legislatureId} name="endDate" type="date" />
      </label>
      <label className="checkbox-row">
        <input defaultChecked name="isPrimary" type="checkbox" />
        Titular
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar miembro
      </button>
    </form>
  );
}

export function CommitteeScheduleForm({
  committees,
  legislatureId
}: {
  committees: StandingCommittee[];
  legislatureId: string | null;
}) {
  const state = useSubmitState();

  return (
    <form className="admin-form two-column-form" data-reset="true" onSubmit={state.handleSubmit}>
      <input name="action" type="hidden" value="save-committee-schedule" />
      <input name="legislatureId" type="hidden" value={legislatureId ?? ""} />
      <FormFeedback error={state.error} message={state.message} />
      <label>
        ComisiÃ³n
        <CommitteeSelect committees={committees} name="committeeId" required />
      </label>
      <label>
        Regla ordinaria
        <input disabled={!legislatureId} name="ruleDescription" required />
      </label>
      <label>
        Frecuencia
        <input disabled={!legislatureId} name="frequency" placeholder="mensual" />
      </label>
      <label>
        DÃ­a de la semana
        <input disabled={!legislatureId} name="weekday" placeholder="miÃ©rcoles" />
      </label>
      <label>
        Semana del mes
        <input disabled={!legislatureId} max="5" min="1" name="weekOfMonth" type="number" />
      </label>
      <label>
        Hora
        <input disabled={!legislatureId} name="time" type="time" />
      </label>
      <label>
        Excepciones
        <textarea disabled={!legislatureId} name="exceptions" rows={3} />
      </label>
      <ActiveCheckbox />
      <button className="button primary form-fit" disabled={!legislatureId || state.saving} type="submit">
        <Save size={17} />
        Guardar regla
      </button>
    </form>
  );
}
