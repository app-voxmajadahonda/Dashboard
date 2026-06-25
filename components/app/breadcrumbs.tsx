import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function AppBreadcrumbs({
  icon,
  items
}: {
  icon?: ReactNode;
  items: BreadcrumbItem[];
}) {
  return (
    <nav aria-label="Ruta de navegación" className="app-breadcrumbs">
      {icon ? <span className="breadcrumb-icon">{icon}</span> : null}
      {items.map((item, index) => (
        <span className="breadcrumb-part" key={`${item.label}-${index}`}>
          {index > 0 ? <ChevronRight size={14} /> : null}
          {item.href ? <a href={item.href}>{item.label}</a> : <strong>{item.label}</strong>}
        </span>
      ))}
    </nav>
  );
}
