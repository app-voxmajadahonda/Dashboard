import {
  BadgeEuro,
  BriefcaseBusiness,
  Building2,
  Car,
  Euro,
  FileText,
  Flag,
  Landmark,
  Scale,
  Shield,
  Users,
  Vote
} from "lucide-react";
import type { DataSource } from "@/components/dashboard/dashboard-components";

export const sources = {
  ine: {
    label: "INE / dato pendiente de sincronización",
    updatedAt: "2026-06-21",
    confidence: "media",
    status: "pendiente_validacion"
  },
  madridStats: {
    label: "Instituto de Estadística Comunidad de Madrid",
    updatedAt: "2026-06-21",
    confidence: "media",
    status: "pendiente_validacion"
  },
  internal: {
    label: "Carga interna portavoz/admin",
    updatedAt: "2026-06-21",
    confidence: "media",
    status: "interno"
  },
  officialPending: {
    label: "Fuente oficial pendiente de carga",
    updatedAt: "Pendiente",
    confidence: "baja",
    status: "desactualizado"
  }
} satisfies Record<string, DataSource>;

export const generalKpis = [
  {
    label: "Población total",
    value: "Pendiente",
    detail: "Dato preparado para sincronizar desde INE o carga manual.",
    icon: Users,
    source: sources.ine
  },
  {
    label: "Renta media por hogar",
    value: "Pendiente",
    detail: "Agencia Tributaria / INE, con caducidad de 30 días.",
    icon: BadgeEuro,
    source: sources.officialPending
  },
  {
    label: "Presupuesto por habitante",
    value: "Pendiente",
    detail: "Se calculará al cargar presupuesto y población validada.",
    icon: Euro,
    source: sources.internal
  },
  {
    label: "Concejales VOX",
    value: "4",
    detail: "Grupo Municipal VOX Majadahonda.",
    icon: Vote,
    source: {
      label: "Perfil municipal configurado",
      updatedAt: "2026-06-21",
      confidence: "alta",
      status: "interno"
    } satisfies DataSource,
    tone: "strong" as const
  }
];

export const demographicEvolution = [
  { label: "2020", value: 71000, display: "71k" },
  { label: "2021", value: 71500, display: "71,5k" },
  { label: "2022", value: 72000, display: "72k" },
  { label: "2023", value: 72500, display: "72,5k" },
  { label: "2024", value: 72800, display: "72,8k" }
];

export const ageStructure = [
  { label: "0-14", value: 16, display: "16%" },
  { label: "15-29", value: 15, display: "15%" },
  { label: "30-44", value: 18, display: "18%" },
  { label: "45-64", value: 31, display: "31%" },
  { label: "65+", value: 20, display: "20%" }
];

export const institutionalEvents = [
  {
    date: "Pendiente",
    time: "09:30",
    body: "Pleno ordinario",
    type: "Sesión plenaria",
    status: "Convocatoria pendiente"
  },
  {
    date: "Pendiente",
    time: "10:00",
    body: "Comisión informativa de Hacienda",
    type: "Comisión",
    status: "Documentación pendiente"
  },
  {
    date: "Pendiente",
    time: "12:00",
    body: "Junta de Portavoces",
    type: "Órgano político",
    status: "Por confirmar"
  }
];

export const motions = [
  ["Plan de seguridad en zonas comerciales", "Pendiente", "Seguridad", "Concejal asignado", "Borrador"],
  ["Bonificaciones fiscales a familias", "Pendiente", "Fiscalidad", "Equipo económico", "En análisis"],
  ["Mejora de accesibilidad urbana", "Pendiente", "Urbanismo", "Concejal asignado", "Registrable"]
];

export const questions = [
  ["Solicitud de expediente de contratación", "Contratación", "10 días", "Pendiente respuesta"],
  ["Pregunta sobre plantilla de Policía Local", "Seguridad", "Pendiente", "Preparar pleno"],
  ["Ruego sobre mantenimiento de zonas verdes", "Servicios", "Pendiente", "Recibido vecino"]
];

export const votePatterns = [
  ["Grupo", "A favor", "En contra", "Abstención", "Observación"],
  ["VOX", "Pendiente", "Pendiente", "Pendiente", "Datos por pleno"],
  ["PP", "Pendiente", "Pendiente", "Pendiente", "Gobierno"],
  ["PSOE", "Pendiente", "Pendiente", "Pendiente", "Oposición"],
  ["VPMJ", "Pendiente", "Pendiente", "Pendiente", "Oposición"],
  ["MM", "Pendiente", "Pendiente", "Pendiente", "Oposición"]
];

export const securityKpis = [
  {
    label: "Plantilla Policía Local",
    value: "Pendiente",
    detail: "Plantilla presupuestada, real y vacantes.",
    icon: Shield,
    source: sources.internal
  },
  {
    label: "Ratio policías / 1.000 hab.",
    value: "Pendiente",
    detail: "Requiere plantilla real y población validada.",
    icon: Users,
    source: sources.officialPending
  },
  {
    label: "Criminalidad trimestral",
    value: "Pendiente",
    detail: "Carga manual de informe del Ministerio del Interior.",
    icon: Scale,
    source: sources.officialPending
  },
  {
    label: "Asuntos abiertos",
    value: "6",
    detail: "Seguimiento político interno.",
    icon: Flag,
    source: sources.internal,
    tone: "critical" as const
  }
];

export const crimeEvolution = [
  { label: "T1", value: 100, display: "base" },
  { label: "T2", value: 112, display: "+12%" },
  { label: "T3", value: 108, display: "+8%" },
  { label: "T4", value: 119, display: "+19%" }
];

export const securityIssues = [
  ["Falta de efectivos", "Alta", "Pregunta al pleno", "Pendiente"],
  ["Coordinación Policía Local / Guardia Civil", "Media", "Solicitud reunión", "En análisis"],
  ["Botellón y zonas comerciales", "Media", "Seguimiento vecinal", "Abierto"]
];

export const budgetKpis = [
  {
    label: "Presupuesto total",
    value: "Pendiente",
    detail: "Presupuesto municipal cargado por año.",
    icon: Euro,
    source: sources.internal
  },
  {
    label: "Gasto corriente / hab.",
    value: "Pendiente",
    detail: "Requiere gasto corriente y población validada.",
    icon: Building2,
    source: sources.officialPending
  },
  {
    label: "Deuda por habitante",
    value: "Pendiente",
    detail: "Dato presupuestario/fiscal a validar.",
    icon: Landmark,
    source: sources.officialPending
  },
  {
    label: "Ordenanzas cargadas",
    value: "0",
    detail: "Pendientes de carga y extracción por portavoz/admin.",
    icon: FileText,
    source: sources.internal,
    tone: "critical" as const
  }
];

export const budgetEvolution = [
  { label: "2023", value: 100, display: "base" },
  { label: "2024", value: 104, display: "+4%" },
  { label: "2025", value: 108, display: "+8%" },
  { label: "2026", value: 111, display: "+11%" },
  { label: "2027", value: 113, display: "+13%" }
];

export const fiscalOrdinances = [
  ["IBI", "Pendiente", "Pendiente", "Pendiente", "Cargar ordenanza"],
  ["IVTM", "Pendiente", "Pendiente", "Pendiente", "Cargar ordenanza"],
  ["ICIO", "Pendiente", "Pendiente", "Pendiente", "Cargar ordenanza"],
  ["Plusvalía", "Pendiente", "Pendiente", "Pendiente", "Cargar ordenanza"],
  ["Tasa de basuras", "Pendiente", "Pendiente", "Pendiente", "Cargar ordenanza"]
];

export const comparisonRows = [
  { municipality: "Majadahonda", values: ["Pendiente", "Pendiente", "Pendiente", "Pendiente"] },
  { municipality: "Las Rozas", values: ["Pendiente", "Pendiente", "Pendiente", "Pendiente"] },
  { municipality: "Pozuelo de Alarcón", values: ["Pendiente", "Pendiente", "Pendiente", "Pendiente"] },
  { municipality: "Boadilla del Monte", values: ["Pendiente", "Pendiente", "Pendiente", "Pendiente"] },
  { municipality: "Torrelodones", values: ["Pendiente", "Pendiente", "Pendiente", "Pendiente"] }
];

export const serviceRows = [
  ["Centros educativos", "Pendiente", "Manual / Ayuntamiento", "Pendiente validación"],
  ["Instalaciones deportivas", "Pendiente", "Manual / Ayuntamiento", "Pendiente validación"],
  ["Centros culturales", "Pendiente", "Manual / Ayuntamiento", "Pendiente validación"],
  ["Monte del Pilar", "Pendiente", "Manual / Ayuntamiento", "Pendiente validación"],
  ["Transporte público", "Pendiente", "Manual / Ayuntamiento", "Pendiente validación"]
];

export const politicalProfile = [
  ["Alcalde", "Lola Moreno", "PP", "Configurado"],
  ["Partido de gobierno", "PP", "15 concejales", "Configurado"],
  ["VOX", "4 concejales", "Principal grupo de oposición", "Configurado"],
  ["Portavoz", "Pendiente de ficha", "VOX", "Pendiente validación"]
];

export const sidebarSections = [
  { href: "#informacion-general", label: "Información general", icon: Users },
  { href: "#institucional", label: "Institucional", icon: Vote },
  { href: "#seguridad", label: "Seguridad", icon: Car },
  { href: "#presupuesto-y-fiscalidad", label: "Presupuesto y fiscalidad", icon: Euro },
  { href: "#documentos", label: "Documentos y fuentes", icon: FileText },
  { href: "#observaciones", label: "Observaciones", icon: BriefcaseBusiness }
];
