import { ArrowRight, FileSearch, LockKeyhole, Network, ShieldCheck } from "lucide-react";

const publicFeatures = [
  {
    title: "Fiscalizacion documental",
    text: "Seguimiento de decretos, acuerdos, actas, ordenes del dia y expedientes.",
    icon: FileSearch
  },
  {
    title: "Trabajo interno protegido",
    text: "Acceso reservado para portavoz, concejales e integraciones autorizadas.",
    icon: LockKeyhole
  },
  {
    title: "Conectores y automatizaciones",
    text: "Preparado para fuentes municipales, boletines oficiales, Drive y n8n.",
    icon: Network
  }
];

export default function PublicHomePage() {
  return (
    <main className="public-page">
      <header className="public-nav">
        <a className="public-brand" href="/">
          <span className="brand-mark">GM</span>
          <span>Dashboard Grupo Municipal</span>
        </a>
        <a className="button primary" href="/login">
          <LockKeyhole size={17} />
          Acceso privado
        </a>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <div className="eyebrow">
            <ShieldCheck size={16} />
            Vox Majadahonda · MVP cloud
          </div>
          <h1>Seguimiento politico y documental para grupos municipales</h1>
          <p>
            Una aplicacion para ordenar documentos, detectar acciones de gobierno,
            preparar fiscalizacion, coordinar tareas y generar informes.
          </p>
          <div className="public-actions">
            <a className="button primary" href="/login">
              Entrar al area privada
              <ArrowRight size={17} />
            </a>
            <a className="button" href="/api/health">
              Estado del servicio
            </a>
          </div>
        </div>

        <div className="public-summary" aria-label="Resumen del sistema">
          <div>
            <span className="summary-value">24/7</span>
            <span className="summary-label">Disponible en la nube</span>
          </div>
          <div>
            <span className="summary-value">3</span>
            <span className="summary-label">Roles iniciales</span>
          </div>
          <div>
            <span className="summary-value">API</span>
            <span className="summary-label">Preparado para integraciones</span>
          </div>
        </div>
      </section>

      <section className="public-feature-grid">
        {publicFeatures.map((feature) => (
          <article className="public-feature" key={feature.title}>
            <feature.icon size={22} />
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
