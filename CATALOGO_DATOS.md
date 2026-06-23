# Catálogo de datos y fuentes

## Objetivo

Este documento define qué datos debe manejar la aplicación, de dónde deben salir, quién los valida y cuándo caducan. La regla general es que ningún dato relevante del dashboard debe quedar como texto estático sin fuente.

## Estados de origen

- `api_oficial`: dato obtenido de una API o fuente pública estable.
- `documento_oficial`: dato extraído de PDF, Excel, CSV o documento oficial cargado.
- `carga_manual`: dato introducido por portavoz/admin porque no existe fuente automatizable.
- `calculo_interno`: dato calculado por la app a partir de otros datos validados.
- `pendiente_fuente`: dato previsto pero todavía sin fuente definida.

## Reglas de caducidad inicial

- Población y padrón: 30 días.
- Presupuesto aprobado: 365 días, salvo modificación presupuestaria.
- Ordenanzas fiscales: 365 días o hasta nueva publicación.
- Criminalidad trimestral: 120 días.
- Contratación: 7 a 30 días según fuente.
- Plenos, comisiones y calendario: 1 a 7 días.
- Programa electoral: sin caducidad, pero con revisión de seguimiento mensual.

## Catálogo inicial

| Área | Dato | Fuente preferente | Alternativa | Caducidad | Valida |
| --- | --- | --- | --- | --- | --- |
| Datos generales | Población total | INE | Carga manual desde dato oficial | 30 días | Portavoz/admin |
| Datos generales | Evolución de población | INE | Excel/CSV oficial | 30 días | Portavoz/admin |
| Datos generales | Edad media | INE / Comunidad de Madrid | Carga manual | 30 días | Portavoz/admin |
| Datos generales | Hogares | INE | Carga manual | 30 días | Portavoz/admin |
| Datos generales | Renta media | INE / AEAT | Carga manual | 365 días | Portavoz/admin |
| Fiscalidad | Presupuesto total | Ayuntamiento / transparencia | PDF/Excel presupuesto | 365 días | Portavoz/admin |
| Fiscalidad | Presupuesto por habitante | Cálculo interno | - | Depende de población y presupuesto | Sistema + revisión |
| Fiscalidad | IBI | Ordenanza fiscal | PDF oficial | 365 días | Portavoz/admin |
| Fiscalidad | IVTM | Ordenanza fiscal | PDF oficial | 365 días | Portavoz/admin |
| Fiscalidad | ICIO | Ordenanza fiscal | PDF oficial | 365 días | Portavoz/admin |
| Fiscalidad | Plusvalía | Ordenanza fiscal | PDF oficial | 365 días | Portavoz/admin |
| Seguridad | Plantilla Policía Local | Ayuntamiento / presupuesto / RPT | Documento oficial | 90 días | Portavoz/admin |
| Seguridad | Criminalidad trimestral | Ministerio del Interior | PDF/CSV cargado | 120 días | Portavoz/admin |
| Contratos | Contratos abiertos | Plataforma contratación | Carga documental | 7 días | Portavoz/admin |
| Contratos | Adjudicaciones | Plataforma contratación | Portal transparencia | 7 días | Portavoz/admin |
| Proyectos | Proyectos municipales | Ayuntamiento / presupuesto / expedientes | Carga manual | 30 días | Portavoz/admin |
| Electoral | Resultados 2019 | Ministerio / Junta Electoral | Carga manual | Sin caducidad | Portavoz/admin |
| Electoral | Resultados 2023 | Ministerio / Junta Electoral | Carga manual | Sin caducidad | Portavoz/admin |
| Electoral | Programa electoral | Documento oficial VOX | PDF cargado | Sin caducidad | Portavoz/admin |

## Siguiente trabajo

1. Crear formulario de carga manual de indicadores en configuración.
2. Vincular cada indicador a `data_sources.source_key`.
3. Guardar `expires_at` automáticamente según la caducidad de la fuente.
4. Crear revisión del portavoz para pasar de `pendiente_validacion` a `oficial`.
5. Sustituir progresivamente los datos de respaldo por indicadores reales.
