import { Landmark, LockKeyhole, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { Suspense } from "react";
import municipalProfile from "@/config/municipal-profile.json";
import { LoginForm } from "@/components/auth/login-form";

const totalSeats = municipalProfile.councilGroups.reduce(
  (sum, group) => sum + group.seats,
  0
);

const chamberSeats = municipalProfile.councilGroups.flatMap((group) =>
  Array.from({ length: group.seats }, (_, index) => ({
    id: `${group.shortName}-${index}`,
    color: group.color,
    shortName: group.shortName
  }))
);

export default function PublicHomePage() {
  const { municipality, mayor } = municipalProfile;
  const { boundarySources } = municipality;

  return (
    <main className="portal-page">
      <header className="portal-top">
        <a className="portal-brand" href="/">
          <span className="brand-mark">VOX</span>
          <span>{municipalProfile.portalTitle}</span>
        </a>
        <aside className="portal-login compact" aria-label="Acceso privado">
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
        </aside>
      </header>

      <section className="portal-command">
        <div className="portal-title-block">
          <div className="eyebrow">
            <ShieldCheck size={16} />
            Mandato {municipality.mandate} · {municipality.name}
          </div>
          <h1>{municipalProfile.portalTitle}</h1>
          <p>
            Herramienta de dirección política para controlar documentación,
            acción de gobierno, expedientes, agenda institucional y seguimiento
            estratégico del grupo municipal.
          </p>
        </div>

        <div className="municipal-facts" aria-label="Datos configurados del municipio">
          <article>
            <span>Municipio</span>
            <strong>{municipality.name}</strong>
            <small>{municipality.province}, {municipality.region}</small>
          </article>
          <article>
            <span>Alcaldía</span>
            <strong>{mayor.name}</strong>
            <small>{mayor.party} · {mayor.mandate}</small>
          </article>
          <article>
            <span>{municipality.population.label}</span>
            <strong>{municipality.population.value}</strong>
            <small>{municipality.population.sourceName}</small>
          </article>
        </div>
      </section>

      <section className="portal-visual-grid">
        <article className="official-map-card">
          <div className="section-heading">
            <div>
              <h2>Mapa territorial</h2>
              <span>Límites oficiales de Comunidad de Madrid y municipio</span>
            </div>
            <strong>INE {municipality.ineCode}</strong>
          </div>

          <div className="official-map-frame">
            <div className="map-watermark">CAM</div>
            <div className="map-focus">
              <MapPin size={22} />
              <strong>{municipality.name}</strong>
              <span>{municipality.coordinates.latitude}, {municipality.coordinates.longitude}</span>
            </div>
            <div className="map-status">{boundarySources.status}</div>
          </div>

          <div className="map-sources">
            <a href={boundarySources.region.url}>{boundarySources.region.label}</a>
            <a href={boundarySources.municipality.url}>{boundarySources.municipality.label}</a>
          </div>
        </article>

        <article className="council-chamber-card">
          <div className="section-heading">
            <div>
              <h2>Composición del Pleno</h2>
              <span>{totalSeats} concejales · mandato {municipality.mandate}</span>
            </div>
            <UsersRound size={22} />
          </div>

          <div className="chamber" aria-label="Hemiciclo del Pleno">
            {chamberSeats.map((seat, index) => {
              const angle = 200 - (index * 140) / Math.max(chamberSeats.length - 1, 1);
              const radius = index < 13 ? 43 : 33;
              const left = 50 + Math.cos((angle * Math.PI) / 180) * radius;
              const top = 86 - Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <span
                  aria-label={seat.shortName}
                  className="chamber-seat"
                  key={seat.id}
                  style={{
                    backgroundColor: seat.color,
                    left: `${left}%`,
                    top: `${top}%`
                  }}
                />
              );
            })}
            <div className="chamber-dais">
              <Landmark size={18} />
              Pleno
            </div>
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
        </article>
      </section>
    </main>
  );
}
