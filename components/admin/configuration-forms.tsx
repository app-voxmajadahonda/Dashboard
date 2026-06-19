"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { AlertTriangle, FileUp, Globe2, Save, ShieldAlert } from "lucide-react";

type ConfigurationFormsProps = {
  organization: {
    name: string;
    municipality: string;
    province?: string | null;
    municipal_website?: string | null;
    transparency_portal?: string | null;
    electronic_office?: string | null;
    settings?: Record<string, unknown>;
  };
  requirements: {
    id: string;
    title: string;
    description: string | null;
    document_kind: string;
    source_preference: string;
  }[];
  documents: {
    id: string;
    title: string;
    kind: string;
    processing_status: string;
    created_at: string;
  }[];
};

function getNestedString(settings: Record<string, unknown> | undefined, key: string, subKey?: string) {
  const value = settings?.[key];

  if (!subKey) {
    return typeof value === "string" ? value : "";
  }

  if (value && typeof value === "object" && subKey in value) {
    const nested = (value as Record<string, unknown>)[subKey];
    return typeof nested === "string" ? nested : "";
  }

  return "";
}

async function submitForm(endpoint: string, form: HTMLFormElement) {
  const response = await fetch(endpoint, {
    method: "POST",
    body: new FormData(form)
  });
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se ha podido guardar.");
  }

  return payload?.message ?? "Guardado correctamente.";
}

export function ConfigurationForms({ organization, requirements, documents }: ConfigurationFormsProps) {
  const [sourcesMessage, setSourcesMessage] = useState<string | null>(null);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [municipalityMessage, setMunicipalityMessage] = useState<string | null>(null);
  const [municipalityError, setMunicipalityError] = useState<string | null>(null);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const [isRequestingMunicipality, setIsRequestingMunicipality] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  async function handleSources(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourcesMessage(null);
    setSourcesError(null);
    setIsSavingSources(true);

    try {
      setSourcesMessage(await submitForm("/api/admin/config", event.currentTarget));
    } catch (error) {
      setSourcesError(error instanceof Error ? error.message : "No se ha podido guardar.");
    } finally {
      setIsSavingSources(false);
    }
  }

  async function handleMunicipality(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMunicipalityMessage(null);
    setMunicipalityError(null);
    setIsRequestingMunicipality(true);

    try {
      setMunicipalityMessage(await submitForm("/api/admin/config", event.currentTarget));
    } catch (error) {
      setMunicipalityError(error instanceof Error ? error.message : "No se ha podido registrar.");
    } finally {
      setIsRequestingMunicipality(false);
    }
  }

  async function handleDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDocumentMessage(null);
    setDocumentError(null);
    setIsUploadingDocument(true);

    try {
      setDocumentMessage(await submitForm("/api/admin/base-documents", event.currentTarget));
      event.currentTarget.reset();
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "No se ha podido subir.");
    } finally {
      setIsUploadingDocument(false);
    }
  }

  const settings = organization.settings ?? {};

  return (
    <div className="config-layout">
      <section className="panel critical-config-panel">
        <div className="panel-header">
          <div>
            <h2>Cambiar de municipio</h2>
            <p>Opción crítica: no aplica el cambio directamente, abre un proceso de revisión.</p>
          </div>
          <ShieldAlert size={22} />
        </div>
        <div className="critical-warning">
          <AlertTriangle size={18} />
          <span>
            Cambiar de municipio obliga a revisar portada, fuentes, pleno, ordenanzas, presupuestos,
            calendario, documentos base y automatizaciones.
          </span>
        </div>
        <form className="admin-form" onSubmit={handleMunicipality}>
          {municipalityMessage ? <div className="form-success">{municipalityMessage}</div> : null}
          {municipalityError ? <div className="form-error">{municipalityError}</div> : null}
          <input name="action" type="hidden" value="municipality-change" />
          <label>
            Municipio actual
            <input disabled value={organization.municipality} />
          </label>
          <label>
            Nuevo municipio
            <input name="nextMunicipality" placeholder="Ej. Pozuelo de Alarcón" required />
          </label>
          <label>
            Provincia
            <input name="nextProvince" placeholder="Ej. Madrid" />
          </label>
          <label>
            Confirmación obligatoria
            <input name="confirmation" placeholder="Escribe CAMBIAR MUNICIPIO" required />
          </label>
          <button className="button primary" disabled={isRequestingMunicipality} type="submit">
            <ShieldAlert size={17} />
            {isRequestingMunicipality ? "Registrando..." : "Abrir proceso crítico"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Fuentes, web y redes sociales</h2>
            <p>Datos configurables del municipio y del grupo municipal.</p>
          </div>
          <Globe2 size={22} />
        </div>
        <form className="admin-form two-column-form" onSubmit={handleSources}>
          {sourcesMessage ? <div className="form-success form-wide">{sourcesMessage}</div> : null}
          {sourcesError ? <div className="form-error form-wide">{sourcesError}</div> : null}
          <input name="action" type="hidden" value="sources" />
          <label>
            Web del Ayuntamiento
            <input
              defaultValue={organization.municipal_website ?? ""}
              name="municipalWebsite"
              placeholder="https://www.ayuntamiento.es"
              type="url"
            />
          </label>
          <label>
            Portal de transparencia
            <input
              defaultValue={organization.transparency_portal ?? ""}
              name="transparencyPortal"
              placeholder="https://..."
              type="url"
            />
          </label>
          <label>
            Sede electrónica
            <input
              defaultValue={organization.electronic_office ?? ""}
              name="electronicOffice"
              placeholder="https://..."
              type="url"
            />
          </label>
          <label>
            Página VOX del municipio
            <input
              defaultValue={getNestedString(settings, "voxMunicipalUrl")}
              name="voxMunicipalUrl"
              placeholder="https://www.voxespana.es/tag/majadahonda"
              type="url"
            />
          </label>
          <label>
            X / Twitter
            <input defaultValue={getNestedString(settings, "socialLinks", "x")} name="xUrl" type="url" />
          </label>
          <label>
            Instagram
            <input
              defaultValue={getNestedString(settings, "socialLinks", "instagram")}
              name="instagramUrl"
              type="url"
            />
          </label>
          <label>
            Facebook
            <input
              defaultValue={getNestedString(settings, "socialLinks", "facebook")}
              name="facebookUrl"
              type="url"
            />
          </label>
          <label>
            Telegram
            <input
              defaultValue={getNestedString(settings, "socialLinks", "telegram")}
              name="telegramUrl"
              type="url"
            />
          </label>
          <label className="form-wide">
            Notas sobre fuentes
            <textarea
              defaultValue={getNestedString(settings, "sourceNotes")}
              name="sourceNotes"
              placeholder="Fuentes oficiales pendientes, observaciones o enlaces que revisar."
              rows={4}
            />
          </label>
          <button className="button primary form-fit" disabled={isSavingSources} type="submit">
            <Save size={17} />
            {isSavingSources ? "Guardando..." : "Guardar fuentes"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Documentación base</h2>
            <p>Subida de ordenanzas, presupuesto, ROM y decreto de delegaciones.</p>
          </div>
          <FileUp size={22} />
        </div>
        <form className="admin-form two-column-form" onSubmit={handleDocument}>
          {documentMessage ? <div className="form-success form-wide">{documentMessage}</div> : null}
          {documentError ? <div className="form-error form-wide">{documentError}</div> : null}
          <label>
            Tipo de documento
            <select name="documentKind" required>
              <option value="fiscal_ordinance">Ordenanza fiscal</option>
              <option value="budget">Presupuesto municipal</option>
              <option value="delegation_decree">Decreto de delegaciones</option>
              <option value="rom">ROM municipal</option>
              <option value="report">Informe u otra documentación base</option>
            </select>
          </label>
          <label>
            Título
            <input name="title" placeholder="Ej. Ordenanza fiscal IBI 2026" required />
          </label>
          <label>
            Fuente
            <input name="sourceName" placeholder="Ayuntamiento / carga manual" />
          </label>
          <label>
            URL oficial si existe
            <input name="sourceUrl" placeholder="https://..." type="url" />
          </label>
          <label>
            Fecha oficial
            <input name="officialDate" type="date" />
          </label>
          <label>
            Fichero
            <input accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain" name="file" required type="file" />
          </label>
          <button className="button primary form-fit" disabled={isUploadingDocument} type="submit">
            <FileUp size={17} />
            {isUploadingDocument ? "Subiendo..." : "Subir y clasificar"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Documentos necesarios</h2>
            <p>Base mínima para configurar un municipio con análisis útil.</p>
          </div>
          <FileUp size={22} />
        </div>
        <div className="requirement-grid">
          {requirements.map((requirement) => (
            <article className="requirement-card" key={requirement.id}>
              <strong>{requirement.title}</strong>
              <p>{requirement.description}</p>
              <span>{requirement.source_preference}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Últimos documentos base</h2>
            <p>Documentos ya registrados para esta organización.</p>
          </div>
          <FileUp size={22} />
        </div>
        <div className="status-list">
          {documents.length ? (
            documents.map((document) => (
              <div className="status-item" key={document.id}>
                <div>
                  <div className="status-title">{document.title}</div>
                  <div className="status-meta">{document.kind}</div>
                </div>
                <span className="badge blue">{document.processing_status}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">Todavía no hay documentos base cargados.</div>
          )}
        </div>
      </section>
    </div>
  );
}
