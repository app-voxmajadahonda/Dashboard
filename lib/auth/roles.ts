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
    value: "spokesperson",
    label: "Portavoz",
    description: "Coordina estrategia, valida datos, asigna tareas y aprueba procesos del grupo."
  },
  {
    value: "councillor",
    label: "Concejal / Equipo municipal",
    description: "Consulta y trabaja documentos, mociones, comisiones, tareas e informes."
  },
  {
    value: "communications_manager",
    label: "Responsable de comunicación",
    description: "Gestiona campañas, notas, redes y coordinación comunicativa."
  },
  {
    value: "advisor",
    label: "Asesor",
    description: "Apoya el trabajo del grupo municipal según permisos asignados."
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
