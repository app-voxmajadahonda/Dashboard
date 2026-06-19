import type { AppRole } from "@/lib/types";

export const appRoles: Array<{
  value: AppRole;
  label: string;
  description: string;
}> = [
  {
    value: "admin",
    label: "Administrador / Portavoz",
    description: "Gestiona usuarios, entidad, fuentes, integraciones y permisos."
  },
  {
    value: "councillor",
    label: "Concejal / Equipo municipal",
    description: "Consulta y trabaja documentos, mociones, comisiones, tareas e informes."
  },
  {
    value: "api_integration",
    label: "Integracion externa / API",
    description: "Acceso tecnico restringido para sistemas externos autorizados."
  }
];

export function getRoleLabel(role: AppRole) {
  return appRoles.find((item) => item.value === role)?.label ?? role;
}
