import {
  Archive,
  BriefcaseBusiness,
  CalendarDays,
  Euro,
  FileText,
  FolderKanban,
  Gauge,
  Landmark,
  Megaphone,
  MessageSquareText,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCheck,
  Vote
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import municipalProfile from "@/config/municipal-profile.json";

const menuGroups = [
  {
    label: "Inicio",
    items: [
      { label: "Panel privado de dirección", href: "/dashboard", icon: Gauge },
      { label: "Calendario", href: "#", icon: CalendarDays },
      { label: "Tareas y equipo", href: "#", icon: UserCheck }
    ]
  },
  {
    label: "Procesos",
    items: [
      { label: "Plenos", href: "#", icon: Vote },
      { label: "Comisiones", href: "#", icon: Landmark },
      { label: "Mociones", href: "#", icon: FileText },
      { label: "Programa electoral", href: "#", icon: FileText }
    ]
  },
  {
    label: "Seguimiento",
    items: [
      { label: "Expedientes", href: "#", icon: FolderKanban },
      { label: "Contratos", href: "#", icon: BriefcaseBusiness },
      { label: "Decretos", href: "#", icon: ReceiptText },
      { label: "Presupuesto", href: "#", icon: Euro },
      { label: "Preguntas de vecinos", href: "#", icon: MessageSquareText }
    ]
  },
  {
    label: "Documentos",
    items: [
      { label: "Repositorio", href: "#", icon: Archive },
      { label: "Documentos a validar", href: "#", icon: FileText },
      { label: "Plan estratégico", href: "/admin/config", icon: FileText },
      { label: "Plan de comunicación", href: "/admin/config", icon: Megaphone }
    ]
  },
  {
    label: "Administración",
    items: [
      { label: "Configuración", href: "/admin/config", icon: Settings },
      { label: "Usuarios y roles", href: "/admin/users", icon: ShieldCheck },
      { label: "Campañas", href: "#", icon: Megaphone },
      { label: "Comunicación", href: "#", icon: MessageSquareText }
    ]
  }
];

export function PrivateTopNav() {
  return (
    <header className="private-top-nav">
      <a className="private-brand" href="/dashboard">
        <span className="brand-mark">VOX</span>
        <span>
          <strong>Portal Grupo Municipal</strong>
          <small>{municipalProfile.municipality.name}</small>
        </span>
      </a>

      <nav className="private-menu" aria-label="Navegación privada">
        {menuGroups.map((group) => (
          <details className="private-menu-group" key={group.label}>
            <summary>{group.label}</summary>
            <div className="private-menu-popover">
              {group.items.map((item) => (
                <a href={item.href} key={item.label}>
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </details>
        ))}
      </nav>

      <div className="private-session">
        <a className="button" href="/admin/config">
          <Settings size={17} />
          Configuración
        </a>
        <LogoutButton />
      </div>
    </header>
  );
}
