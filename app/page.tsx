import { LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import madridMap from "@/config/geo/madrid-map.json";
import { LoginForm } from "@/components/auth/login-form";
import { getFallbackPublicProfile, getPublicDataCache } from "@/lib/cache/public-data";
import { getOrganizationBrandAsset } from "@/lib/organization-assets";

export const revalidate = 900;

export default async function PublicHomePage() {
  const municipalProfile = getFallbackPublicProfile();
  const { municipality, mayor } = municipalProfile;
  const { boundarySources } = municipality;
  const [{ pressPosts, publicEvents }, brand] = await Promise.all([
    getPublicDataCache(),
    getOrganizationBrandAsset()
  ]);
  const totalSeats = municipalProfile.councilGroups.reduce(
    (sum, group) => sum + group.seats,
    0
  );

  return (
    <main className="portal-page">
      <header className="portal-top">
        <Link className="portal-brand" href="/">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={brand.logoAlt} className="public-brand-logo" src={brand.logoUrl} />
          ) : (
            <span className="brand-mark">VOX</span>
          )}
          <span>{brand.logoUrl ? "Mandato 2023-2027" : brand.fallbackText}</span>
        </Link>
      </header>

      <section className="portal-layout">
        <div className="portal-main">
          <section className="portal-command">
            <div className="portal-title-block">
              <div className="eyebrow">
                <ShieldCheck size={16} />
                Mandato {municipality.mandate} · {municipality.name}
              </div>
              <h1>Portal interno del Grupo Municipal</h1>
              <p>
                Herramienta de dirección política para controlar documentación,
                acción de gobierno, expedientes y seguimiento estratégico.
              </p>
            </div>

            <div className="municipal-facts" aria-label="Datos configurados del municipio">
              <article>
                <span>Municipio</span>
                <strong>{municipality.name}</strong>
                <small>
                  {municipality.province}, {municipality.region}
                </small>
              </article>
              <article>
                <span>Alcaldía</span>
                <strong>{mayor.name}</strong>
                <small>
                  {mayor.party} · {mayor.mandate}
                </small>
              </article>
              <article>
                <span>Gobierno</span>
                <strong>
                  <span
                    className="party-logo-chip"
                    style={{ backgroundColor: mayor.partyColor }}
                  >
                    {mayor.partyLogoText}
                  </span>
                  {mayor.party}
                </strong>
                <small>Partido de gobierno</small>
              </article>
              <article>
                <span>{municipality.population.label}</span>
                <strong>{municipality.population.value}</strong>
                <small>{municipality.population.sourceName}</small>
              </article>
              <article>
                <span>{municipality.budget.label}</span>
                <strong>{municipality.budget.value}</strong>
                <small>{municipality.budget.sourceName}</small>
              </article>
              <article>
                <span>Superficie</span>
                <strong>{municipality.surfaceKm2} km²</strong>
                <small>Densidad: {municipality.density}</small>
              </article>
            </div>
          </section>

          <article className="official-map-card">
            <div className="section-heading">
              <div>
                <h2>Mapa territorial</h2>
                <span>Límites oficiales de Comunidad de Madrid y municipio</span>
              </div>
              <strong>INE {municipality.ineCode}</strong>
            </div>

            <div className="official-map-frame">
              <svg
                aria-label="Mapa real de municipios de la Comunidad de Madrid con Majadahonda destacada"
                className="official-boundary-map"
                role="img"
                viewBox={madridMap.viewBox}
              >
                {madridMap.municipalities.map((municipalityBoundary) => (
                  <path
                    className={municipalityBoundary.isSelected ? "is-selected" : undefined}
                    d={municipalityBoundary.path}
                    key={municipalityBoundary.natCode}
                  >
                    <title>{municipalityBoundary.name}</title>
                  </path>
                ))}
              </svg>
              <div className="map-badge">{municipality.name} destacado</div>
            </div>

            <div className="map-meta">
              <span>{boundarySources.status}</span>
              <div className="map-sources">
                <a href={boundarySources.region.url}>{boundarySources.region.label}</a>
                <a href={boundarySources.municipality.url}>
                  {boundarySources.municipality.label}
                </a>
              </div>
            </div>
          </article>
        </div>

        <aside className="portal-side">
          <div className="portal-login compact" aria-label="Acceso privado">
            <div className="login-card-header">
              <div className="card-icon strong">
                <LockKeyhole size={19} />
              </div>
              <div>
                <h2>Acceso privado</h2>
                <p>Usuarios autorizados</p>
              </div>
            </div>
            <Suspense fallback={<div className="login-form">Cargando acceso...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          <article className="council-chamber-card">
            <div className="section-heading">
              <div>
                <h2>Composición del Pleno</h2>
                <span>
                  {totalSeats} concejales · mandato {municipality.mandate}
                </span>
              </div>
              <UsersRound size={22} />
            </div>

            <div className="council-bar" aria-label="Gráfico electoral del Pleno">
              {municipalProfile.councilGroups.map((group) => (
                <span
                  key={group.shortName}
                  style={{
                    backgroundColor: group.color,
                    width: `${(group.seats / totalSeats) * 100}%`
                  }}
                  title={`${group.shortName}: ${group.seats}`}
                />
              ))}
            </div>

            <div className="seat-list compact">
              {municipalProfile.councilGroups.map((group) => (
                <div className="seat-row" key={group.shortName}>
                  <span className="party-dot" style={{ backgroundColor: group.color }} />
                  <span>{group.shortName}</span>
                  <strong>{group.seats}</strong>
                </div>
              ))}
            </div>

            <div className="majority-note">
              <span>Mayoría absoluta</span>
              <strong>13</strong>
            </div>
          </article>

          <article className="press-card">
            <div className="section-heading">
              <div>
                <h2>Últimas notas de VOX</h2>
                <span>Actualidad vinculada al municipio</span>
              </div>
            </div>
            <div className="press-link-list">
              {pressPosts.length ? (
                pressPosts.map((post) => (
                  <a href={post.url} key={post.url}>
                    {post.title}
                  </a>
                ))
              ) : (
                <span>No hay notas disponibles en este momento.</span>
              )}
            </div>
          </article>

          <article className="press-card public-events-card">
            <div className="section-heading">
              <div>
                <h2>Próximos eventos institucionales</h2>
                <span>Información pública básica</span>
              </div>
            </div>
            <div className="press-link-list">
              {publicEvents.length ? (
                publicEvents.map((event) => (
                  <span key={event.id}>
                    {event.title} · {event.event_type} ·{" "}
                    {new Intl.DateTimeFormat("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short"
                    }).format(new Date(event.starts_at))}
                  </span>
                ))
              ) : (
                <span>Aún no hay eventos institucionales públicos cargados.</span>
              )}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
