"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { AlertTriangle, DatabaseZap, FileUp, Globe2, ListChecks, Save, ShieldAlert } from "lucide-react";

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
  dataCatalog: {
    id: string;
    data_key: string;
    display_name: string;
    dashboard_tab: string;
    dashboard_section: string;
    data_path: string;
    source_type: string;
    preferred_source: string;
    source_url: string | null;
    fallback_source: string | null;
    automation_level: string;
    refresh_interval_days: number | null;
    target_indicator_key: string;
    status: string;
  }[];
  dataSources: {
    id: string;
    source_key: string;
    label: string;
    provider: string;
    source_url: string | null;
    refresh_interval_days: number;
    enabled: boolean;
    updated_at: string;
  }[];
  indicators: {
    id: string;
    label: string;
    source_key: string | null;
    data_status: string;
    updated_at: string;
    expires_at: string | null;
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

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-ES");
}

function freshnessLabel(expiresAt: string | null) {
  if (!expiresAt) {
    return "Sin caducidad";
  }

  return new Date(expiresAt).getTime() < Date.now() ? "Caducado" : `Vigente hasta ${formatDate(expiresAt)}`;
}

export function ConfigurationForms({
  organization,
  requirements,
  documents,
  dataSources,
  dataCatalog,
  indicators
}: ConfigurationFormsProps) {
  const [sourcesMessage, setSourcesMessage] = useState<string | null>(null);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [municipalityMessage, setMunicipalityMessage] = useState<string | null>(null);
  const [municipalityError, setMunicipalityError] = useState<string | null>(null);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [dataSourcesMessage, setDataSourcesMessage] = useState<string | null>(null);
  const [dataSourcesError, setDataSourcesError] = useState<string | null>(null);
  const [indicatorMessage, setIndicatorMessage] = useState<string | null>(null);
  const [indicatorError, setIndicatorError] = useState<string | null>(null);
  const [isSavingSources, setIsSavingSources] = useState(false);
  const [isSavingDataSources, setIsSavingDataSources] = useState(false);
  const [isSavingIndicator, setIsSavingIndicator] = useState(false);
  const [isRequestingMunicipality, setIsRequestingMunicipality] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  async function handleDataSources(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDataSourcesMessage(null);
    setDataSourcesError(null);
    setIsSavingDataSources(true);

    try {
      setDataSourcesMessage(await submitForm("/api/admin/config", event.currentTarget));
    } catch (error) {
      setDataSourcesError(error instanceof Error ? error.message : "No se han podido guardar las fuentes.");
    } finally {
      setIsSavingDataSources(false);
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

  async function handleIndicator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIndicatorMessage(null);
    setIndicatorError(null);
    setIsSavingIndicator(true);

    try {
      setIndicatorMessage(await submitForm("/api/admin/indicators", event.currentTarget));
      event.currentTarget.reset();
    } catch (error) {
      setIndicatorError(error instanceof Error ? error.message : "No se ha podido cargar el indicador.");
    } finally {
      setIsSavingIndicator(false);
    }
  }

  async function handleSyncPublicData() {
    setSyncMessage(null);
    setSyncError(null);
    setIsSyncing(true);

    try {
      const response = await fetch("/api/admin/sync-public-data", {
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as {
        synced?: string[];
        skipped?: string[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se ha podido sincronizar.");
      }

      setSyncMessage(
        `Sincronización completada. Actualizado: ${payload?.synced?.join(", ") || "ninguno"}. Pendiente: ${
          payload?.skipped?.join(", ") || "ninguno"
        }.`
      );
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "No se ha podido sincronizar.");
    } finally {
      setIsSyncing(false);
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
            <h2>Fuentes de datos y caducidad</h2>
            <p>Controla de dónde sale cada dato y cada cuánto debe revisarse o sincronizarse.</p>
          </div>
          <DatabaseZap size={22} />
        </div>
        <form className="data-source-form" onSubmit={handleDataSources}>
          {dataSourcesMessage ? <div className="form-success">{dataSourcesMessage}</div> : null}
          {dataSourcesError ? <div className="form-error">{dataSourcesError}</div> : null}
          <input name="action" type="hidden" value="data-sources" />
          <input name="sourceCount" type="hidden" value={dataSources.length} />
          <div className="data-source-grid">
            {dataSources.map((source, index) => (
              <article className="data-source-card" key={source.id}>
                <input name={`sourceKey-${index}`} type="hidden" value={source.source_key} />
                <label>
                  Fuente
                  <input defaultValue={source.label} name={`label-${index}`} required />
                </label>
                <label>
                  Proveedor
                  <input defaultValue={source.provider} name={`provider-${index}`} required />
                </label>
                <label>
                  URL o API oficial
                  <input defaultValue={source.source_url ?? ""} name={`sourceUrl-${index}`} placeholder="https://..." />
                </label>
                <label>
                  Caducidad del dato
                  <select defaultValue={source.refresh_interval_days} name={`refreshIntervalDays-${index}`}>
                    <option value="1">1 día</option>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="365">1 año</option>
                  </select>
                </label>
                <label className="checkbox-row">
                  <input defaultChecked={source.enabled} name={`enabled-${index}`} type="checkbox" />
                  Fuente activa
                </label>
              </article>
            ))}
          </div>
          <button className="button primary form-fit" disabled={isSavingDataSources} type="submit">
            <Save size={17} />
            {isSavingDataSources ? "Guardando..." : "Guardar caducidades"}
          </button>
        </form>
        <div className="freshness-panel">
          <strong>Últimos indicadores cargados</strong>
          {indicators.length ? (
            <div className="status-list">
              {indicators.map((indicator) => (
                <div className="status-item" key={indicator.id}>
                  <div>
                    <div className="status-title">{indicator.label}</div>
                    <div className="status-meta">
                      {indicator.source_key ?? "Sin fuente vinculada"} · actualizado {formatDate(indicator.updated_at)}
                    </div>
                  </div>
                  <span className="badge green">{freshnessLabel(indicator.expires_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Todavía no hay indicadores reales cargados.</div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Catálogo de datos</h2>
            <p>Inventario de datos que deben alimentar los dashboards, con fuente y caducidad.</p>
          </div>
          <ListChecks size={22} />
        </div>
        <form className="admin-form two-column-form" onSubmit={handleIndicator}>
          {indicatorMessage ? <div className="form-success form-wide">{indicatorMessage}</div> : null}
          {indicatorError ? <div className="form-error form-wide">{indicatorError}</div> : null}
          <label className="form-wide">
            Dato del catálogo
            <select name="catalogItemId" required>
              <option value="">Selecciona un dato</option>
              {dataCatalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.dashboard_tab} / {item.dashboard_section} / {item.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valor mostrado
            <input name="displayValue" placeholder="Ej. 73.625 habitantes" required />
          </label>
          <label>
            Valor numérico opcional
            <input name="rawValue" placeholder="Ej. 73625" />
          </label>
          <label>
            Periodo
            <input name="period" placeholder="Ej. 2025 o actual" />
          </label>
          <label>
            Unidad
            <input name="unit" placeholder="habitantes, €, %, etc." />
          </label>
          <label>
            Estado del dato
            <select defaultValue="pendiente_validacion" name="dataStatus">
              <option value="oficial">Oficial</option>
              <option value="pendiente_validacion">Pendiente validación</option>
              <option value="estimado">Estimado</option>
              <option value="interno">Interno</option>
              <option value="desactualizado">Desactualizado</option>
            </select>
          </label>
          <label>
            Confianza
            <select defaultValue="media" name="confidence">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </label>
          <label>
            Fuente concreta
            <input name="sourceName" placeholder="INE, Ayuntamiento, documento oficial..." />
          </label>
          <label>
            URL fuente
            <input name="sourceUrl" placeholder="https://..." type="url" />
          </label>
          <label className="form-wide">
            Detalle u observación
            <textarea name="detail" placeholder="Contexto, notas de validación o referencia del documento." rows={3} />
          </label>
          <button className="button primary form-fit" disabled={isSavingIndicator} type="submit">
            <Save size={17} />
            {isSavingIndicator ? "Guardando..." : "Cargar indicador"}
          </button>
        </form>
        <div className="catalog-table">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Dato</th>
                  <th>Pestaña</th>
                  <th>Fuente</th>
                  <th>Auto</th>
                  <th>Caducidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {dataCatalog.slice(0, 30).map((item) => (
                  <tr key={item.id}>
                    <td>{item.display_name}</td>
                    <td>{item.dashboard_tab}</td>
                    <td>{item.preferred_source}</td>
                    <td>{item.automation_level}</td>
                    <td>{item.refresh_interval_days ? `${item.refresh_interval_days} días` : "Sin caducidad"}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Mostrando los primeros 30 datos. El listado completo queda en <code>CATALOGO_DATOS.md</code>.
          </p>
        </div>
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
        <div className="sync-box">
          {syncMessage ? <div className="form-success">{syncMessage}</div> : null}
          {syncError ? <div className="form-error">{syncError}</div> : null}
          <div>
            <strong>Caché de datos públicos</strong>
            <p>
              Sincroniza fuentes externas y guarda el resultado en base de datos para acelerar la
              portada y evitar consultas continuas.
            </p>
          </div>
          <button className="button" disabled={isSyncing} onClick={handleSyncPublicData} type="button">
            <DatabaseZap size={17} />
            {isSyncing ? "Sincronizando..." : "Sincronizar datos públicos"}
          </button>
        </div>
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
              <option value="electoral_program">Programa electoral</option>
              <option value="strategic_plan">Plan estratégico</option>
              <option value="communication_plan">Plan de comunicación</option>
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
