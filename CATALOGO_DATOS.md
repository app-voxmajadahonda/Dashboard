# Catálogo de datos y fuentes

## Objetivo

Este fichero es la lista viva de datos que la aplicación debe mostrar, su ubicación en la interfaz, la fuente prevista, si se puede automatizar y cuándo debe caducar. Está pensado para que el portavoz pueda revisarlo, corregirlo y añadir nuevos datos antes de convertirlos en indicadores reales.

La regla de diseño es sencilla: ningún dato relevante del dashboard debe quedar como texto estático sin fuente, fecha de actualización, caducidad y responsable de validación.

## Verificación inicial realizada

Dato comprobado: `Población total`.

Fuente oficial localizada:

- INE, tabla `2881`: `Madrid: Población por municipios y sexo`.
- URL tabla: `https://www.ine.es/jaxiT3/Tabla.htm?t=2881`
- URL JSON: `https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM`
- Municipio: `Majadahonda`, código INE `28080`.
- Dato total 2025 localizado: `73.625` habitantes.
- Periodicidad oficial: anual, con referencia a 1 de enero.

Conclusión: el dato de población de Majadahonda es automatizable desde INE. Para la aplicación, se propone caducidad operativa de 90 días para evitar consultas continuas y permitir revisión periódica, aunque la publicación sea anual.

## Estados de origen

- `api_oficial`: dato obtenido de API, JSON o fuente pública estable.
- `documento_oficial`: dato extraído de PDF, Excel, CSV o documento oficial cargado.
- `carga_manual`: dato introducido por portavoz/admin porque no existe fuente automatizable fiable.
- `calculo_interno`: dato calculado por la app a partir de otros datos validados.
- `pendiente_fuente`: dato previsto, todavía sin fuente definida.

## Tabla de datos

| Dato | Pestaña | Sección | Ruta del dato | Automatizable | Fuente preferente | Alternativa si no hay API | Caducidad | Destino BD | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Población total | Datos generales | Demografía | `/concejal#datos-generales > KPIs > Población total` | Sí | INE tabla 2881 JSON | Carga manual desde INE | 90 días | `municipal_indicators.total_population` | Verificado |
| Evolución de población | Datos generales | Demografía | `/concejal#datos-generales > Evolución población` | Sí | INE tabla 2881 JSON | CSV/Excel INE | 90 días | `municipal_indicators.population_evolution` | Verificado fuente |
| Población por sexo | Datos generales | Demografía | `/concejal#datos-generales > Demografía` | Sí | INE tabla 2881 JSON | CSV/Excel INE | 90 días | `municipal_indicators.population_by_sex` | Verificado fuente |
| Población por edad | Datos generales | Demografía | `/concejal#datos-generales > Población por edad` | Por verificar | INE / Comunidad de Madrid | Carga manual | 90 días | `municipal_indicators.population_by_age` | Pendiente |
| Edad media | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Por verificar | INE / Comunidad de Madrid | Carga manual | 90 días | `municipal_indicators.average_age` | Pendiente |
| Índice de envejecimiento | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Cálculo interno | INE edad + población | Carga manual | 90 días | `municipal_indicators.aging_index` | Pendiente |
| Número de hogares | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Por verificar | INE | Carga manual | 180 días | `municipal_indicators.households` | Pendiente |
| Tamaño medio hogar | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Cálculo interno | INE hogares + población | Carga manual | 180 días | `municipal_indicators.average_household_size` | Pendiente |
| Población extranjera total | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Por verificar | INE padrón | Carga manual | 90 días | `municipal_indicators.foreign_population_total` | Pendiente |
| Principales nacionalidades extranjeras | Datos generales | Demografía | `/concejal#datos-generales > Demografía detallada` | Por verificar | INE padrón | Carga manual | 90 días | `municipal_indicators.foreign_nationalities` | Pendiente |
| Renta media por persona | Datos generales | Socioeconomía | `/concejal#datos-generales > Datos socioeconómicos` | Por verificar | INE / AEAT | Carga manual | 365 días | `municipal_indicators.average_income_person` | Pendiente |
| Renta media por hogar | Datos generales | Socioeconomía | `/concejal#datos-generales > KPI renta` | Por verificar | INE / AEAT | Carga manual | 365 días | `municipal_indicators.average_household_income` | Pendiente |
| Tasa de paro | Datos generales | Socioeconomía | `/concejal#datos-generales > Datos socioeconómicos` | Por verificar | SEPE / Comunidad de Madrid | Carga manual | 30 días | `municipal_indicators.unemployment_rate` | Pendiente |
| Número de parados | Datos generales | Socioeconomía | `/concejal#datos-generales > Datos socioeconómicos` | Por verificar | SEPE / Comunidad de Madrid | Carga manual | 30 días | `municipal_indicators.unemployed_total` | Pendiente |
| Precio medio vivienda | Datos generales | Socioeconomía | `/concejal#datos-generales > Datos socioeconómicos` | No inicial | Fuente externa / carga manual | Informe cargado | 90 días | `municipal_indicators.housing_price_m2` | Pendiente |
| Centros educativos | Datos generales | Servicios | `/concejal#datos-generales > Servicios` | No inicial | Ayuntamiento / Comunidad de Madrid | Carga manual | 365 días | `municipal_indicators.education_centers` | Pendiente |
| Instalaciones deportivas | Datos generales | Servicios | `/concejal#datos-generales > Servicios` | No inicial | Ayuntamiento | Carga manual | 365 días | `municipal_indicators.sports_facilities` | Pendiente |
| Centros sanitarios | Datos generales | Servicios | `/concejal#datos-generales > Servicios` | No inicial | Comunidad de Madrid / Ayuntamiento | Carga manual | 365 días | `municipal_indicators.health_centers` | Pendiente |
| Zonas verdes | Datos generales | Servicios | `/concejal#datos-generales > Servicios` | No inicial | Ayuntamiento | Carga manual | 365 días | `municipal_indicators.green_areas` | Pendiente |
| Superficie Monte del Pilar | Datos generales | Servicios | `/concejal#datos-generales > Servicios` | No inicial | Ayuntamiento | Carga manual | 365 días | `municipal_indicators.monte_pilar_surface` | Pendiente |
| Alcalde | Datos generales | Ficha política | `/concejal#datos-generales > Ficha política` | No frecuente | Decreto/acta constitución | Carga manual | Legislatura | `municipal_indicators.mayor` | Pendiente |
| Partido de gobierno | Datos generales | Ficha política | `/concejal#datos-generales > Ficha política` | No frecuente | Acta constitución / web municipal | Carga manual | Legislatura | `municipal_indicators.governing_party` | Pendiente |
| Composición del pleno | Datos generales | Ficha política | `/concejal#datos-generales > Ficha política` | No frecuente | Junta Electoral / acta constitución | Carga manual | Legislatura | `municipal_indicators.council_composition` | Pendiente |
| Concejales delegados | Control institucional | Organización municipal | `/concejal#control-institucional` | Documento | Decreto de delegaciones | Carga PDF | Legislatura o cambio | `municipal_indicators.delegated_councillors` | Pendiente |
| Comisiones creadas | Control institucional | Comisiones | `/concejal#control-institucional` | Documento | Acuerdo plenario / ROM | Carga PDF | Legislatura o cambio | `municipal_indicators.committees` | Pendiente |
| Miembros de comisiones | Control institucional | Comisiones | `/concejal#control-institucional` | Documento | Acuerdo plenario | Carga PDF | Legislatura o cambio | `municipal_indicators.committee_members` | Pendiente |
| Calendario de plenos | Control institucional | Calendario | Barra derecha calendario | Por verificar | ROM / calendario municipal | Carga manual | 30 días | `municipal_indicators.plenary_calendar` | Pendiente |
| Plazos de mociones | Control institucional | Plazos | Barra derecha alertas | Documento | ROM municipal | Carga PDF | Legislatura o cambio | `municipal_indicators.motion_deadlines` | Pendiente |
| Preguntas y ruegos | Control institucional | Iniciativas | `/concejal#control-institucional` | No inicial | Registro municipal / carga interna | Carga manual | 7 días | `municipal_indicators.questions_and_requests` | Pendiente |
| Votaciones por grupo | Control institucional | Votaciones | `/concejal#control-institucional` | No inicial | Actas de pleno | Carga PDF | Por pleno | `municipal_indicators.vote_patterns` | Pendiente |
| Presupuesto total | Fiscalidad y presupuesto | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | Documento | Presupuesto municipal PDF/Excel | Carga manual | 365 días | `municipal_indicators.total_budget` | Pendiente |
| Presupuesto por habitante | Fiscalidad y presupuesto | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | Cálculo interno | Presupuesto + población | - | Según entradas | `municipal_indicators.budget_per_capita` | Pendiente |
| Gasto corriente por habitante | Fiscalidad y presupuesto | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | Cálculo interno | Presupuesto + población | - | Según entradas | `municipal_indicators.current_spending_per_capita` | Pendiente |
| Deuda por habitante | Fiscalidad y presupuesto | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | Cálculo interno | Deuda + población | Carga manual | 365 días | `municipal_indicators.debt_per_capita` | Pendiente |
| IBI | Fiscalidad y presupuesto | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Documento | Ordenanza fiscal IBI | Carga PDF | 365 días | `municipal_indicators.ibi_rate` | Pendiente |
| IVTM | Fiscalidad y presupuesto | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Documento | Ordenanza fiscal IVTM | Carga PDF | 365 días | `municipal_indicators.ivtm_rates` | Pendiente |
| ICIO | Fiscalidad y presupuesto | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Documento | Ordenanza fiscal ICIO | Carga PDF | 365 días | `municipal_indicators.icio_rate` | Pendiente |
| Plusvalía | Fiscalidad y presupuesto | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Documento | Ordenanza fiscal IIVTNU | Carga PDF | 365 días | `municipal_indicators.iivtnu_rates` | Pendiente |
| Tasa de basuras | Fiscalidad y presupuesto | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Documento | Ordenanza/tasa | Carga PDF | 365 días | `municipal_indicators.waste_tax` | Pendiente |
| Contratos abiertos | Seguimiento de contratos | Contratación | `/concejal#contratos` | Por verificar | Plataforma de Contratación | Carga documental | 7 días | `municipal_indicators.open_contracts` | Pendiente |
| Adjudicaciones | Seguimiento de contratos | Contratación | `/concejal#contratos` | Por verificar | Plataforma de Contratación | Carga documental | 7 días | `municipal_indicators.awarded_contracts` | Pendiente |
| Prórrogas de contratos | Seguimiento de contratos | Contratación | `/concejal#contratos` | No inicial | Expedientes / acuerdos | Carga documental | 30 días | `municipal_indicators.contract_extensions` | Pendiente |
| Contratos menores | Seguimiento de contratos | Contratación | `/concejal#contratos` | Por verificar | Portal transparencia | Carga documental | 30 días | `municipal_indicators.minor_contracts` | Pendiente |
| Proyectos prioritarios | Seguimiento de proyectos | Proyectos | `/concejal#proyectos` | No inicial | Ayuntamiento / presupuesto / expedientes | Carga manual | 30 días | `municipal_indicators.priority_projects` | Pendiente |
| Hitos de proyectos | Seguimiento de proyectos | Hitos | `/concejal#proyectos` | No inicial | Expedientes / actas | Carga manual | 30 días | `municipal_indicators.project_milestones` | Pendiente |
| Resultados electorales 2019 | Análisis electoral | Resultados | `/concejal#analisis-electoral` | Por verificar | Ministerio Interior / Junta Electoral | Carga manual | Sin caducidad | `municipal_indicators.election_2019_results` | Pendiente |
| Resultados electorales 2023 | Análisis electoral | Resultados | `/concejal#analisis-electoral` | Por verificar | Ministerio Interior / Junta Electoral | Carga manual | Sin caducidad | `municipal_indicators.election_2023_results` | Pendiente |
| Evolución electoral VOX | Análisis electoral | VOX | `/concejal#analisis-electoral` | Cálculo interno | Resultados electorales | - | Sin caducidad | `municipal_indicators.vox_electoral_evolution` | Pendiente |
| Programa electoral | Promesas electorales | Programa | `/concejal#promesas-electorales` | Documento | Programa electoral PDF | Carga PDF | Sin caducidad | `municipal_indicators.electoral_program_measures` | Pendiente |
| Medidas sin iniciativa | Promesas electorales | Seguimiento | `/concejal#promesas-electorales` | Cálculo interno | Programa + iniciativas | - | 30 días | `municipal_indicators.program_measures_without_actions` | Pendiente |
| Plantilla Policía Local | Datos generales | Seguridad | Futuro bloque seguridad | Documento | Presupuesto/RPT/plantilla | Carga PDF | 90 días | `municipal_indicators.local_police_staff` | Pendiente |
| Ratio policías por 1.000 habitantes | Datos generales | Seguridad | Futuro bloque seguridad | Cálculo interno | Plantilla + población | - | Según entradas | `municipal_indicators.police_ratio_per_1000` | Pendiente |
| Criminalidad trimestral | Datos generales | Seguridad | Futuro bloque seguridad | Documento/API pendiente | Ministerio Interior | Carga PDF/CSV | 120 días | `municipal_indicators.quarterly_crime` | Pendiente |

## Siguiente trabajo técnico

1. Mantener esta tabla como referencia funcional.
2. Sembrar el catálogo en base de datos con la migración `0010_data_catalog.sql`.
3. Crear pantalla de configuración para ver y editar este catálogo.
4. Crear formulario de carga manual de indicadores reales.
5. Calcular `expires_at` automáticamente según la caducidad definida en el catálogo.
6. Crear flujo de validación del portavoz antes de marcar un dato como `oficial`.
