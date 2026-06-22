import type { LucideIcon } from "lucide-react";

export type DataStatus = "oficial" | "pendiente_validacion" | "estimado" | "interno" | "desactualizado";

export type DataSource = {
  label: string;
  updatedAt: string;
  confidence: "alta" | "media" | "baja";
  status: DataStatus;
  href?: string;
};

export function StatusBadge({ status }: { status: DataStatus }) {
  const labels: Record<DataStatus, string> = {
    oficial: "Oficial",
    pendiente_validacion: "Pendiente validación",
    estimado: "Estimado",
    interno: "Interno",
    desactualizado: "Desactualizado"
  };

  return <span className={`data-status ${status}`}>{labels[status]}</span>;
}

export function SourceBadge({ source }: { source: DataSource }) {
  const content = (
    <>
      <strong>{source.label}</strong>
      <span>{source.updatedAt} · confianza {source.confidence}</span>
    </>
  );

  return source.href ? (
    <a className="source-badge" href={source.href}>
      {content}
    </a>
  ) : (
    <span className="source-badge">{content}</span>
  );
}

export function KPICard({
  label,
  value,
  detail,
  icon: Icon,
  source,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  source: DataSource;
  tone?: "neutral" | "strong" | "critical";
}) {
  return (
    <article className="dashboard-kpi" data-tone={tone}>
      <header>
        <span>{label}</span>
        <Icon size={18} />
      </header>
      <strong>{value}</strong>
      <p>{detail}</p>
      <footer>
        <StatusBadge status={source.status} />
      </footer>
    </article>
  );
}

export function ChartCard({
  title,
  subtitle,
  data,
  source
}: {
  title: string;
  subtitle: string;
  data: { label: string; value: number; display?: string }[];
  source: DataSource;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <article className="dashboard-card">
      <header className="dashboard-card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <StatusBadge status={source.status} />
      </header>
      <div className="bar-chart" aria-label={title}>
        {data.map((item) => (
          <div className="bar-row" key={item.label}>
            <span>{item.label}</span>
            <div>
              <i style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <strong>{item.display ?? item.value}</strong>
          </div>
        ))}
      </div>
      <SourceBadge source={source} />
    </article>
  );
}

export function DataTable({
  title,
  subtitle,
  columns,
  rows,
  source
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Array<Array<string>>;
  source?: DataSource;
}) {
  return (
    <article className="dashboard-card table-dashboard-card">
      <header className="dashboard-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {source ? <StatusBadge status={source.status} /> : null}
      </header>
      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source ? <SourceBadge source={source} /> : null}
    </article>
  );
}

export function AlertCard({
  title,
  detail,
  priority,
  source
}: {
  title: string;
  detail: string;
  priority: "alta" | "media" | "baja";
  source: DataSource;
}) {
  return (
    <article className="alert-card" data-priority={priority}>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <StatusBadge status={source.status} />
    </article>
  );
}

export function DocumentCard({
  title,
  type,
  status,
  source
}: {
  title: string;
  type: string;
  status: string;
  source: DataSource;
}) {
  return (
    <article className="document-card">
      <strong>{title}</strong>
      <span>{type}</span>
      <p>{status}</p>
      <SourceBadge source={source} />
    </article>
  );
}

export function CalendarView({
  events
}: {
  events: {
    date: string;
    time: string;
    body: string;
    type: string;
    status: string;
  }[];
}) {
  return (
    <div className="calendar-list">
      {events.map((event) => (
        <article key={`${event.date}-${event.time}-${event.body}`}>
          <time>
            <strong>{event.date}</strong>
            <span>{event.time}</span>
          </time>
          <div>
            <strong>{event.body}</strong>
            <p>{event.type}</p>
          </div>
          <span>{event.status}</span>
        </article>
      ))}
    </div>
  );
}

export function FilterBar({ filters }: { filters: string[] }) {
  return (
    <div className="filter-bar">
      {filters.map((filter, index) => (
        <button className={index === 0 ? "active" : undefined} key={filter} type="button">
          {filter}
        </button>
      ))}
    </div>
  );
}

export function EntityDetailView({
  title,
  details
}: {
  title: string;
  details: { label: string; value: string }[];
}) {
  return (
    <article className="entity-detail">
      <h3>{title}</h3>
      <dl>
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function ComparisonTable({
  title,
  rows
}: {
  title: string;
  rows: { municipality: string; values: string[] }[];
}) {
  return (
    <DataTable
      columns={["Municipio", "Presupuesto/hab.", "IBI", "Deuda/hab.", "Inversión/hab."]}
      rows={rows.map((row) => [row.municipality, ...row.values])}
      subtitle="Estructura preparada para datos reales comparables."
      title={title}
    />
  );
}
