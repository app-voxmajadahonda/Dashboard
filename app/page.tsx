import {
  Building2,
  Landmark,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { Suspense } from "react";
import municipalProfile from "@/config/municipal-profile.json";
import { LoginForm } from "@/components/auth/login-form";

const totalSeats = municipalProfile.councilGroups.reduce(
  (sum, group) => sum + group.seats,
  0
);

export default function PublicHomePage() {
  const { municipality, mayor } = municipalProfile;

  return (
    <main className="portal-page">
      <section className="portal-hero">
        <div className="portal-content">
          <header className="portal-header">
            <a className="portal-brand" href="/">
              <span className="brand-mark">VOX</span>
              <span>{municipalProfile.portalTitle}</span>
            </a>
          </header>

          <div className="portal-title-block">
            <div className="eyebrow">
              <ShieldCheck size={16} />
              Acceso interno · Mandato {municipality.mandate}
            </div>
            <h1>{municipalProfile.portalTitle}</h1>
            <p>
              Sistema de trabajo para ordenar documentación, controlar la acción
              de gobierno, preparar iniciativas y coordinar el seguimiento
              político municipal.
            </p>
          </div>

          <div className="municipal-grid" aria-label="Datos configurados del municipio">
            <article className="municipal-card">
              <span className="card-icon">
                <Building2 size={18} />
              </span>
              <div>
                <strong>{municipality.name}</strong>
                <span>
                  {municipality.province}, {municipality.region}
                </span>
              </div>
            </article>

            <article className="municipal-card">
              <span className="card-icon">
                <Landmark size={18} />
              </span>
              <div>
                <strong>Alcaldía: {mayor.name}</strong>
                <span>{mayor.party} · {mayor.mandate}</span>
              </div>
            </article>

            <article className="municipal-card">
              <span className="card-icon">
                <UsersRound size={18} />
              </span>
              <div>
                <strong>{municipality.population.value}</strong>
                <span>{municipality.population.label} · {municipality.population.sourceName}</span>
              </div>
            </article>
          </div>

          <section className="portal-map-panel" aria-label="Localización municipal">
            <div>
              <h2>Municipio configurado</h2>
              <p>
                Código INE {municipality.ineCode}. Superficie {municipality.surfaceKm2} km².
                Datos preparados para sincronización con fuentes oficiales.
              </p>
            </div>
            <div className="region-map" aria-hidden="true">
              <span className="map-label">Comunidad de Madrid</span>
              <span className="municipality-pin">
                <MapPin size={18} />
                {municipality.name}
              </span>
            </div>
          </section>
        </div>

        <aside className="portal-login" aria-label="Acceso privado">
          <div className="login-card-header">
            <div className="card-icon strong">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h2>Acceso privado</h2>
              <p>Usuarios autorizados del grupo municipal.</p>
            </div>
          </div>
          <Suspense fallback={<div className="login-form">Cargando acceso...</div>}>
            <LoginForm />
          </Suspense>
        </aside>
      </section>

      <section className="portal-public-data" aria-label="Contexto institucional">
        <article className="council-card">
          <div className="section-heading">
            <h2>Composición del Pleno</h2>
            <span>{totalSeats} concejales</span>
          </div>
          <div className="seat-list">
            {municipalProfile.councilGroups.map((group) => (
              <div className="seat-row" key={group.shortName}>
                <span className="party-dot" style={{ backgroundColor: group.color }} />
                <span>{group.shortName}</span>
                <strong>{group.seats}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="modules-card">
          <div className="section-heading">
            <h2>Ámbitos de trabajo</h2>
            <span>Portal interno</span>
          </div>
          <div className="module-list">
            {municipalProfile.publicModules.map((module) => (
              <span key={module}>{module}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
