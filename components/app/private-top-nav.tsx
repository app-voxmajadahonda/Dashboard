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
  Vote
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import municipalProfile from "@/config/municipal-profile.json";

const menuGroups = [
  {
    label: "Dirección",
    items: [
      { label: "Mesa del portavoz", href: "/dashboard", icon: Gauge },
      { label: "Configuración", href: "/admin/config", icon: Settings },
      { label: "Usuarios y roles", href: "/admin/users", icon: ShieldCheck }
    ]
  },
  {
    label: "Control institucional",
    items: [
      { label: "Plenos", href: "#", icon: Vote },
      { label: "Mociones", href: "#", icon: FileText },
      { label: "Expedientes", href: "#", icon: FolderKanban },
      { label: "Decretos", href: "#", icon: ReceiptText }
    ]
  },
  {
    label: "Fiscalización",
    items: [
      { label: "Contratos", href: "#", icon: BriefcaseBusiness },
      { label: "Presupuesto", href: "#", icon: Euro },
      { label: "Organización municipal", href: "#", icon: Landmark },
      { label: "Documentos", href: "#", icon: Archive }
    ]
  },
  {
    label: "Comunicación",
    items: [
      { label: "Campañas", href: "#", icon: Megaphone },
      { label: "Comunicación", href: "#", icon: MessageSquareText },
      { label: "Calendario", href: "#", icon: CalendarDays }
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
