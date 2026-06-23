# Modelo de informacion politica municipal

## Proposito

Este documento define el modelo de informacion de la aplicacion del Grupo Municipal VOX Majadahonda. No es solo un inventario de indicadores: es la base funcional para convertir datos, documentos, expedientes y actividad institucional en decisiones politicas, preparacion de plenos, control del gobierno municipal, seguimiento de compromisos y programa electoral 2027.

La aplicacion debe responder de forma practica a esta pregunta:

> Que esta pasando ahora en Majadahonda y que tiene que hacer el concejal antes del proximo pleno?

## Principios

- Ningun dato relevante debe mostrarse sin fuente, fecha de actualizacion, caducidad y responsable de validacion.
- Las entidades institucionales no son indicadores. Un alcalde, un pleno, una comision o un contrato son entidades. Una tasa, un importe, un porcentaje o un estado medible son indicadores.
- Todo dato debe poder transformarse en alerta, tarea, pregunta, mocion, accion de prensa, hilo en redes, argumento de pleno o propuesta para el programa 2027.
- Los datos pueden llegar por API oficial, documento oficial, carga manual, calculo interno o fuente externa. La app debe conservar trazabilidad.
- Los datos sensibles o politicamente relevantes deben quedar pendientes de validacion hasta que el portavoz/admin los confirme.

## Verificacion inicial realizada

Dato comprobado: `poblacion_total`.

Fuente oficial localizada:

- INE, tabla `2881`: `Madrid: Poblacion por municipios y sexo`.
- URL tabla: `https://www.ine.es/jaxiT3/Tabla.htm?t=2881`
- URL JSON: `https://servicios.ine.es/wstempus/jsCache/es/DATOS_TABLA/2881?tip=AM`
- Municipio: `Majadahonda`, codigo INE `28080`.
- Dato total 2025 localizado: `73.625` habitantes.
- Periodicidad oficial: anual, con referencia a 1 de enero.

Conclusion: `poblacion_total` es automatizable desde INE. Caducidad operativa propuesta: 90 dias, aunque la publicacion oficial sea anual.

## Pestañas del dashboard de concejal

La navegacion principal del concejal debe evolucionar hacia estas pestañas o bloques desplegables:

| Orden | Pestaña | Pregunta que responde | Estado |
| --- | --- | --- | --- |
| 1 | Sala de Situacion | Que ocurre ahora y que debo hacer antes del proximo pleno? | Pendiente |
| 2 | Datos Generales | Cual es la fotografia municipal basica? | En desarrollo |
| 3 | Institucional | Que plenos, comisiones, preguntas y votaciones debemos seguir? | En desarrollo |
| 4 | Seguridad | Que ocurre con Policia Local, Guardia Civil y criminalidad? | Pendiente |
| 5 | Vivienda | Que ocurre con PAMASA, vivienda publica y mercado residencial? | Pendiente |
| 6 | Presupuesto y Fiscalidad | Como evoluciona el presupuesto y la presion fiscal? | En desarrollo |
| 7 | Control del Gobierno | Que prometio o aprobo el PP y que grado de cumplimiento tiene? | Pendiente |
| 8 | Contratos | Que contratos, prorrogas y adjudicaciones debemos fiscalizar? | En desarrollo |
| 9 | Proyectos | Que proyectos especiales, expedientes e hitos estan abiertos? | En desarrollo |
| 10 | Comunicacion | Que asuntos tienen uso politico, mediatico o de campaña? | Pendiente |
| 11 | Programa 2027 | Que medidas VOX se han defendido y que falta por construir? | Pendiente |
| 12 | Documentos | Donde esta la documentacion que soporta cada dato? | En desarrollo |

## Entidades principales

Estas entidades deben tener modelo propio. No deben guardarse como simples indicadores salvo que se necesite un resumen cuantitativo.

| Entidad | Proposito politico | Campos minimos | Fuente habitual | Caducidad |
| --- | --- | --- | --- | --- |
| `municipio` | Parametrizar la app y contexto municipal | id, nombre, provincia, comunidad, codigo_ine, mandato, poblacion_referencia | INE, configuracion | Revisión anual o cambio de municipio |
| `persona` | Base de cargos, concejales, responsables y terceros | id, nombre, apellidos, cargo, partido, contacto, redes | Configuracion, fuentes oficiales | Segun cambio |
| `concejal` | Gestionar responsabilidades del grupo y del gobierno | persona_id, grupo_politico_id, rol, areas, comisiones | Acta, decreto, configuracion | Legislatura o cambio |
| `grupo_politico` | Composicion del pleno y patron de voto | nombre, siglas, color, concejales, posicion | Junta Electoral, acta constitucion | Legislatura o cambio |
| `pleno` | Preparar y fiscalizar sesiones plenarias | fecha, tipo, orden_dia, acta, video, estado, informe_interno | Ayuntamiento, actas | Por sesion |
| `comision` | Control por areas y preparacion tecnica | nombre, area, miembros, calendario, orden_dia, responsable_vox | Acuerdo plenario, ROM | Legislatura o cambio |
| `junta_portavoces` | Seguir decisiones de portavoces y plazos | fecha, asuntos, acuerdos, tareas, documentacion | Convocatorias, actas internas | Por sesion |
| `expediente` | Fiscalizacion administrativa | numero, area, objeto, estado, documentos, responsable, plazos | Ayuntamiento, sede, solicitudes | Segun expediente |
| `mocion` | Registro y seguimiento de iniciativas politicas | titulo, texto, pleno, responsable, estado, votacion, ejecucion | Registro, pleno | Por iniciativa |
| `pregunta` | Control ordinario al gobierno | titulo, area, fecha_registro, plazo_respuesta, respuesta, estado | Registro | Segun plazo |
| `ruego` | Seguimiento de peticiones politicas | titulo, area, pleno, responsable, respuesta, estado | Registro/pleno | Segun plazo |
| `solicitud_informacion` | Control de acceso a informacion | titulo, expediente, area, fecha_registro, plazo, respuesta, recurso | Registro, sede | Segun plazo |
| `comparecencia` | Peticiones de explicacion politica | tema, organo, responsable, estado, resultado | Registro/pleno/comision | Segun tramitacion |
| `contrato` | Fiscalizacion de contratacion | expediente, objeto, importe, adjudicatario, plazo, prorroga, estado | Plataforma contratacion, portal transparencia | 7-30 dias |
| `proyecto` | Seguimiento de proyectos especiales | nombre, area, hitos, estado, presupuesto, expedientes, riesgos | Ayuntamiento, presupuesto, expedientes | 30 dias |
| `ordenanza` | Marco normativo municipal | titulo, numero, materia, ejercicio, fecha_aprobacion, pdf, estado | BOCM, Ayuntamiento | 365 dias o nueva publicacion |
| `tributo` | Analisis fiscal y propuestas VOX | impuesto/tasa, tipo, bonificaciones, minimo_legal, maximo_legal | Ordenanza, TRLRHL | 365 dias |
| `presupuesto` | Control economico municipal | ejercicio, ingresos, gastos, capitulos, modificaciones, ejecucion | Presupuesto PDF/Excel | 365 dias o modificacion |
| `campana` | Comunicacion politica y movilizacion | titulo, tema, canal, calendario, piezas, impacto | Equipo comunicacion | Segun campaña |
| `documento` | Repositorio y trazabilidad | titulo, tipo, categoria, fuente, archivo, resumen, estado_validacion | Carga o fuente oficial | Segun tipo |
| `fuente` | Trazabilidad de datos | nombre, tipo, organismo, url, documento_id, fiabilidad, periodicidad | Configuracion | Segun fuente |
| `alerta` | Activar respuesta politica | titulo, prioridad, fecha_limite, responsable, entidad_relacionada, accion | Sistema, usuario, dato | Hasta resolucion |
| `insight_politico` | Convertir dato en conclusion politica | titulo, dato_origen, interpretacion, impacto, acciones | Analisis interno/IA | Revision periodica |
| `compromiso_gobierno` | Fiscalizar al PP | compromiso, fuente, area, estado, valoracion, pruebas | Programa PP, notas, plenos | Mandato |
| `medida_programa_vox` | Construir y medir programa VOX | medida, area, programa, iniciativa_asociada, estado, evidencia | Programa VOX | Mandato/2027 |

## Indicadores

La tabla de indicadores debe reservarse para metricas cuantitativas o cualitativas medibles. Todos los indicadores deben tener importancia politica, impacto mediatico, impacto electoral, frecuencia de revision, responsable de validacion y uso preferente.

Campos recomendados para `municipal_indicators`:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | uuid | Identificador |
| `organization_id` | uuid | Organizacion |
| `category` | text | Pestaña o area |
| `indicator_key` | text | Clave estable |
| `label` | text | Nombre visible |
| `value` | jsonb | Valor estructurado |
| `unit` | text | Unidad |
| `period` | text | Ejercicio, trimestre o periodo |
| `source_key` | text | Clave de fuente/catalogo |
| `source_name` | text | Fuente visible |
| `source_url` | text | URL |
| `source_document_id` | uuid | Documento soporte |
| `data_status` | enum/text | Estado normalizado |
| `confidence` | text | alta, media, baja |
| `importance_politica` | integer | 1-5 |
| `impacto_mediatico` | integer | 1-5 |
| `impacto_electoral` | integer | 1-5 |
| `responsable_validacion` | uuid/text | Responsable |
| `uso_preferente` | text[] | pleno, comision, prensa, redes, argumentario, programa_2027 |
| `refresh_interval_days` | integer | Caducidad en dias |
| `expires_at` | timestamptz | Fecha de caducidad |
| `last_checked_at` | timestamptz | Ultima comprobacion de fuente |
| `last_updated_at` | timestamptz | Ultima actualizacion del dato |
| `next_review_at` | timestamptz | Proxima revision |
| `stale_policy` | text | ocultar, advertir, mostrar_como_desactualizado |

## Catalogo inicial de indicadores

| Indicador | Pestaña | Sección | Ruta del dato | Fuente preferente | Automatizacion | Caducidad | Importancia | Uso preferente | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `poblacion_total` | Datos Generales | Demografia | `/concejal#datos-generales > KPIs` | INE tabla 2881 JSON | api_oficial | 90 dias | 2 | argumentario, programa_2027 | Verificado |
| `population_evolution` | Datos Generales | Demografia | `/concejal#datos-generales > Evolucion poblacion` | INE tabla 2881 JSON | api_oficial | 90 dias | 2 | argumentario | Fuente identificada |
| `population_by_sex` | Datos Generales | Demografia | `/concejal#datos-generales > Demografia` | INE tabla 2881 JSON | api_oficial | 90 dias | 2 | argumentario | Fuente identificada |
| `population_by_age` | Datos Generales | Demografia | `/concejal#datos-generales > Poblacion por edad` | INE / Comunidad de Madrid | pendiente_fuente | 90 dias | 3 | programa_2027 | Pendiente |
| `average_age` | Datos Generales | Demografia | `/concejal#datos-generales > Demografia detallada` | INE / Comunidad de Madrid | pendiente_fuente | 90 dias | 2 | argumentario | Pendiente |
| `aging_index` | Datos Generales | Demografia | `/concejal#datos-generales > Demografia detallada` | INE edad + poblacion | calculo_interno | 90 dias | 3 | programa_2027 | Pendiente |
| `households` | Datos Generales | Demografia | `/concejal#datos-generales > Demografia detallada` | INE | pendiente_fuente | 180 dias | 2 | programa_2027 | Pendiente |
| `foreign_population_total` | Datos Generales | Demografia | `/concejal#datos-generales > Demografia detallada` | INE padron | pendiente_fuente | 90 dias | 3 | argumentario | Pendiente |
| `average_income_person` | Datos Generales | Socioeconomia | `/concejal#datos-generales` | INE / AEAT | pendiente_fuente | 365 dias | 3 | argumentario | Pendiente |
| `average_household_income` | Datos Generales | Socioeconomia | `/concejal#datos-generales > KPI renta` | INE / AEAT | pendiente_fuente | 365 dias | 3 | argumentario | Pendiente |
| `unemployment_rate` | Datos Generales | Socioeconomia | `/concejal#datos-generales` | SEPE / Comunidad de Madrid | pendiente_fuente | 30 dias | 4 | pleno, prensa | Pendiente |
| `housing_price_m2` | Vivienda | Mercado vivienda | `/concejal#vivienda` | Fuente externa / informe | carga_manual | 90 dias | 4 | prensa, programa_2027 | Pendiente |
| `pamasa_total_homes` | Vivienda | PAMASA | `/concejal#vivienda > PAMASA` | PAMASA / Ayuntamiento | documento_oficial | 180 dias | 5 | pleno, prensa, programa_2027 | Pendiente |
| `pamasa_empty_homes` | Vivienda | PAMASA | `/concejal#vivienda > PAMASA` | PAMASA / Ayuntamiento | documento_oficial | 90 dias | 5 | pleno, prensa | Pendiente |
| `housing_applicants_registry` | Vivienda | PAMASA | `/concejal#vivienda > Registro demandantes` | PAMASA / Ayuntamiento | documento_oficial | 90 dias | 5 | pleno, programa_2027 | Pendiente |
| `avs_empty_homes` | Vivienda | AVS Comunidad de Madrid | `/concejal#vivienda > AVS` | Comunidad de Madrid / AVS | carga_manual | 90 dias | 5 | pleno, prensa | Dato inicial conocido: 15 viviendas vacias |
| `arco_poniente_housing_potential` | Vivienda | Arco de Poniente | `/concejal#vivienda > Arco de Poniente` | Expedientes urbanisticos | documento_oficial | 90 dias | 5 | pleno, programa_2027 | Pendiente |
| `total_budget` | Presupuesto y Fiscalidad | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | Presupuesto PDF/Excel | documento_oficial | 365 dias | 4 | pleno, argumentario | Pendiente |
| `budget_per_capita` | Presupuesto y Fiscalidad | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | presupuesto + poblacion | calculo_interno | Segun entradas | 4 | pleno, prensa | Pendiente |
| `current_spending_per_capita` | Presupuesto y Fiscalidad | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | presupuesto + poblacion | calculo_interno | Segun entradas | 4 | pleno | Pendiente |
| `debt_per_capita` | Presupuesto y Fiscalidad | Presupuesto | `/concejal#fiscalidad-presupuesto > KPIs` | deuda + poblacion | calculo_interno | 365 dias | 4 | pleno, prensa | Pendiente |
| `ibi_rate` | Presupuesto y Fiscalidad | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Ordenanza fiscal IBI | documento_oficial | 365 dias | 4 | pleno, argumentario | Pendiente |
| `waste_tax` | Presupuesto y Fiscalidad | Ordenanzas | `/concejal#fiscalidad-presupuesto > Fiscalidad` | Ordenanza/tasa | documento_oficial | 365 dias | 5 | pleno, prensa, redes | Pendiente |
| `local_police_staff` | Seguridad | Policia Local | `/concejal#seguridad` | Presupuesto/RPT/plantilla | documento_oficial | 90 dias | 5 | pleno, prensa | Pendiente |
| `police_ratio_per_1000` | Seguridad | Policia Local | `/concejal#seguridad` | plantilla + poblacion | calculo_interno | Segun entradas | 5 | pleno, prensa | Pendiente |
| `quarterly_crime` | Seguridad | Criminalidad | `/concejal#seguridad` | Ministerio Interior | documento_oficial/api_por_verificar | 120 dias | 5 | pleno, prensa, redes | Pendiente |
| `crime_rate_per_1000` | Seguridad | Criminalidad | `/concejal#seguridad` | criminalidad + poblacion | calculo_interno | 120 dias | 5 | pleno, prensa | Pendiente |
| `open_contracts` | Contratos | Contratacion | `/concejal#contratos` | Plataforma de Contratacion | pendiente_fuente | 7 dias | 4 | pleno, comision | Pendiente |
| `awarded_contracts` | Contratos | Contratacion | `/concejal#contratos` | Plataforma de Contratacion | pendiente_fuente | 7 dias | 4 | pleno, comision | Pendiente |
| `minor_contracts` | Contratos | Contratacion | `/concejal#contratos` | Portal transparencia | pendiente_fuente | 30 dias | 3 | comision | Pendiente |
| `priority_projects` | Proyectos | Proyectos especiales | `/concejal#proyectos` | Ayuntamiento / expedientes | carga_manual | 30 dias | 4 | pleno, programa_2027 | Pendiente |
| `election_2019_results` | Analisis electoral | Resultados | `/concejal#analisis-electoral` | Ministerio Interior / Junta Electoral | pendiente_fuente | Sin caducidad | 3 | programa_2027 | Pendiente |
| `election_2023_results` | Analisis electoral | Resultados | `/concejal#analisis-electoral` | Ministerio Interior / Junta Electoral | pendiente_fuente | Sin caducidad | 4 | programa_2027 | Pendiente |
| `vox_electoral_evolution` | Analisis electoral | VOX | `/concejal#analisis-electoral` | resultados electorales | calculo_interno | Sin caducidad | 5 | programa_2027 | Pendiente |
| `followers_instagram` | Comunicacion | Redes | `/concejal#comunicacion` | Instagram / carga manual | fuente_externa | 30 dias | 3 | redes, campaña | Pendiente |
| `followers_x` | Comunicacion | Redes | `/concejal#comunicacion` | X / carga manual | fuente_externa | 30 dias | 3 | redes, campaña | Pendiente |
| `program_measures_without_actions` | Programa 2027 | Medidas VOX | `/concejal#programa-2027` | programa + iniciativas | calculo_interno | 30 dias | 5 | pleno, programa_2027 | Pendiente |

## Entidades institucionales que antes estaban mezcladas como indicadores

Estos datos no deben tratarse como indicadores principales, sino como entidades con tablas propias o vistas derivadas:

| Dato anterior | Entidad correcta | Motivo |
| --- | --- | --- |
| Alcalde | `persona` / `concejal` | Cargo institucional, no metrica |
| Partido de gobierno | `grupo_politico` / `compromiso_gobierno` | Entidad politica |
| Composicion del pleno | `grupo_politico` + vista resumen | Estructura institucional |
| Concejales delegados | `concejal` + decreto delegaciones | Cargo y competencias |
| Comisiones creadas | `comision` | Organo |
| Miembros de comisiones | `comision_miembro` | Relacion entidad-persona |
| Calendario de plenos | `pleno` / `evento_calendario` | Evento |
| Plazos de mociones | `regla_procedimental` derivada del ROM | Regla institucional |
| Preguntas y ruegos | `pregunta` / `ruego` | Iniciativas |
| Votaciones por grupo | `votacion` | Hecho institucional |

## Sala de Situacion

La `Sala de Situacion` debe ser la entrada principal del concejal.

Debe mostrar:

- proximo pleno;
- proximas comisiones;
- alertas abiertas;
- solicitudes de informacion pendientes;
- expedientes relevantes;
- contratos proximos a vencer;
- campañas activas;
- temas prioritarios del mes;
- mociones en preparacion;
- asuntos con alta prioridad politica;
- indicadores estrategicos.

Indicadores estrategicos sugeridos:

| Indicador | Motivo |
| --- | --- |
| `quarterly_crime` | Seguridad y control del gobierno |
| `waste_tax` | Fiscalidad municipal con alto impacto vecinal |
| `pamasa_empty_homes` | Vivienda publica |
| `current_spending_per_capita` | Gasto estructural |
| `real_investment_per_capita` | Ejecucion y modelo de ciudad |
| `pp_promises_unfulfilled` | Control del Gobierno |
| `vox_measures_without_actions` | Programa 2027 |
| `communication_impact` | Capacidad de difusion |

## Vivienda

La pestaña `Vivienda` debe tener modelo propio por su importancia politica.

### PAMASA

| Dato/entidad | Tipo | Fuente | Caducidad | Uso politico |
| --- | --- | --- | --- | --- |
| viviendas gestionadas | indicador | PAMASA / Ayuntamiento | 180 dias | pleno, programa_2027 |
| viviendas en alquiler | indicador | PAMASA | 180 dias | pleno |
| viviendas en venta | indicador | PAMASA | 180 dias | pleno |
| viviendas vacias | indicador | PAMASA | 90 dias | prensa, pleno |
| adjudicaciones por año | indicador/entidad | PAMASA | 365 dias | control |
| rotacion anual | indicador | calculo interno | 365 dias | control |
| ingresos por alquiler | indicador | cuentas PAMASA | 365 dias | presupuesto |
| registro de demandantes | indicador | PAMASA | 90 dias | pleno |
| expedientes abiertos | entidad | PAMASA/Ayuntamiento | 30 dias | control |
| contratos asociados | entidad | plataforma contratacion | 30 dias | control |

### Vivienda publica y protegida

Entidades: `promocion_vivienda`, `vivienda_publica`, `adjudicacion_vivienda`, `expediente_vivienda`.

Campos recomendados: nombre, organismo, regimen, numero_viviendas, tipologias, ubicacion, estado, hitos, cupos_adjudicacion, documentos, expedientes, notas_legales.

### Mercado de vivienda

Indicadores: precio medio compra, precio medio alquiler, evolucion precio/m2, comparativa con Las Rozas, Pozuelo, Boadilla, Torrelodones, Villanueva de la Cañada, Alcobendas, San Sebastian de los Reyes y Collado Villalba.

### Arco de Poniente

Entidad: `proyecto`.

Campos: sectores, estado_urbanistico, hitos, expedientes, bloqueos, potencial_vivienda, potencial_dotaciones, riesgos, oportunidades_politicas.

### AVS Comunidad de Madrid

Dato conocido inicial: 15 viviendas vacias dependientes de la Agencia de Vivienda Social en Majadahonda.

Debe registrarse como indicador `avs_empty_homes`, con fuente pendiente de validacion documental.

## Control del Gobierno

La pestaña `Control del Gobierno` debe fiscalizar al PP durante el mandato 2023-2027.

### Compromisos del PP

Entidad: `compromiso_gobierno`.

Campos: id, titulo, descripcion, fuente, fecha, area, estado, valoracion_politica, documentos, evidencias, responsable_seguimiento, fecha_revision.

Estados: `no_iniciado`, `en_tramite`, `cumplido`, `incumplido`, `abandonado`.

### Acuerdos de pleno

Entidad: `acuerdo_pleno`.

Campos: acuerdo, fecha, proponente, votos, responsable_municipal, estado_ejecucion, grado_cumplimiento, acciones_seguimiento.

### Contradicciones politicas

Entidad: `contradiccion_politica`.

Campos: declaracion_publica, fecha, fuente, actuacion_posterior_contradictoria, valoracion_politica, posible_uso_comunicativo.

### Notas de prensa del gobierno

Entidad: `nota_prensa_gobierno`.

Campos: titulo, fecha, tema, promesa_o_anuncio, realidad_expediente, seguimiento, posible_respuesta_vox.

## Alertas

Entidad: `alerta`.

Campos recomendados:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | uuid | Identificador |
| `organization_id` | uuid | Organizacion |
| `titulo` | text | Titulo visible |
| `descripcion` | text | Detalle |
| `categoria` | text | institucional, contratos, fiscalidad, seguridad, vivienda, comunicacion |
| `prioridad` | text | baja, media, alta, critica |
| `fecha_creacion` | timestamptz | Creacion |
| `fecha_limite` | timestamptz | Plazo |
| `responsable` | uuid/text | Responsable |
| `entidad_relacionada_tipo` | text | contrato, pregunta, mocion, indicador, documento |
| `entidad_relacionada_id` | uuid | Entidad |
| `estado` | text | abierta, en_revision, resuelta, descartada |
| `accion_recomendada` | text | pregunta, nota, solicitud, reunion |
| `fuente_origen` | text | Dato/documento/proceso que genera alerta |

Ejemplos:

- Vence el plazo de respuesta a una solicitud de informacion sobre Policia Local.
- Contrato relevante proximo a vencer.
- Criminalidad sube mas de un 10% interanual.
- Mocion aprobada pendiente de ejecucion por el Gobierno.
- Ordenanza fiscal pendiente de analisis.

## Insights politicos

Entidad: `insight_politico`.

Campos recomendados:

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `organization_id` | uuid |
| `titulo` | text |
| `descripcion` | text |
| `dato_origen` | text/jsonb |
| `entidad_relacionada_tipo` | text |
| `entidad_relacionada_id` | uuid |
| `interpretacion_politica` | text |
| `prioridad_politica` | integer 1-5 |
| `impacto_mediatico` | integer 1-5 |
| `impacto_electoral` | integer 1-5 |
| `riesgo_politico` | integer 1-5 |
| `acciones_sugeridas` | text[] |
| `responsable` | uuid/text |
| `estado` | text |
| `fecha_revision` | timestamptz |

Estados: `borrador`, `validado`, `usado_en_pleno`, `usado_en_prensa`, `archivado`.

Ejemplo:

- Dato origen: `quarterly_crime` sube un 8%.
- Interpretacion: Majadahonda empeora en criminalidad frente a municipios comparables del noroeste.
- Acciones sugeridas: pregunta en comision, solicitud de informe, nota de prensa, hilo en X, intervencion en pleno.

## Fuentes

Entidad: `fuente`.

Campos recomendados:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `id` | uuid | Identificador |
| `organization_id` | uuid | Organizacion |
| `nombre` | text | Nombre visible |
| `tipo` | text | api_oficial, documento_oficial, web_oficial, carga_manual, calculo_interno, fuente_externa |
| `organismo` | text | INE, Ayuntamiento, Comunidad de Madrid, Ministerio |
| `url` | text | URL |
| `documento_id` | uuid | Documento asociado |
| `fecha_publicacion` | date | Fecha oficial |
| `fecha_consulta` | timestamptz | Ultima consulta |
| `periodicidad` | text | anual, trimestral, mensual, bajo demanda |
| `fiabilidad` | text | alta, media, baja |
| `observaciones` | text | Notas |

Cada indicador debe apuntar a una fuente principal y, si procede, a una fuente alternativa.

## Documentos

La pestaña `Documentos` debe funcionar como repositorio unico.

Categorias minimas:

- normativa;
- ROM;
- ROF;
- LBRL;
- Hacienda Local;
- contratos;
- subvenciones;
- procedimiento administrativo;
- presupuestos;
- ordenanzas fiscales;
- seguridad;
- policia local;
- proteccion civil;
- vivienda;
- PAMASA;
- urbanismo;
- Arco de Poniente;
- plenos;
- comisiones;
- decretos;
- informes internos;
- notas de prensa;
- argumentarios;
- campañas.

Campos recomendados para `documento`:

| Campo | Tipo |
| --- | --- |
| `id` | uuid |
| `titulo` | text |
| `tipo` | text |
| `categoria` | text |
| `subcategoria` | text |
| `fecha` | date |
| `fuente` | text |
| `archivo` | storage path |
| `enlace` | text |
| `resumen` | text |
| `entidades_relacionadas` | jsonb |
| `etiquetas` | text[] |
| `estado_validacion` | text |
| `responsable` | uuid/text |
| `fecha_actualizacion` | timestamptz |

Estados de documento: `cargado`, `pendiente_extraccion`, `procesado`, `pendiente_validacion`, `validado`, `sustituido`, `archivado`.

## Caducidad

No usar texto libre como unica referencia. La caducidad debe quedar estructurada.

Campos:

- `refresh_interval_days`
- `expires_at`
- `last_checked_at`
- `last_updated_at`
- `next_review_at`
- `stale_policy`

Valores de `stale_policy`:

- `ocultar`
- `advertir`
- `mostrar_como_desactualizado`

Reglas iniciales:

| Tipo de dato | Caducidad |
| --- | --- |
| Poblacion/padron | 90 dias operativos |
| Presupuesto aprobado | 365 dias o modificacion |
| Ordenanzas fiscales | 365 dias o nueva publicacion |
| Criminalidad trimestral | 120 dias |
| Contratacion | 7-30 dias |
| Plenos/comisiones/calendario | 1-7 dias |
| Programa electoral | Sin caducidad, revision mensual de seguimiento |
| Composicion del pleno/delegaciones/comisiones | Legislatura o cambio |

## Estados normalizados

### Indicadores

- `pendiente_fuente`
- `fuente_identificada`
- `automatizable`
- `carga_manual`
- `importado`
- `pendiente_validacion`
- `validado`
- `oficial`
- `estimado`
- `desactualizado`
- `descartado`

### Entidades institucionales

- `borrador`
- `registrado`
- `en_tramite`
- `pendiente_respuesta`
- `respondido`
- `cerrado`
- `archivado`

### Documentos

- `cargado`
- `pendiente_extraccion`
- `procesado`
- `pendiente_validacion`
- `validado`
- `sustituido`
- `archivado`

## Importacion documental

El portavoz/admin debe poder cargar:

- PDF;
- DOCX;
- XLSX;
- CSV;
- imagenes escaneadas.

La app debe:

1. guardar el documento;
2. asociarlo a una entidad;
3. extraer metadatos;
4. extraer datos estructurados cuando sea posible;
5. crear indicadores derivados;
6. dejar todo pendiente de validacion;
7. marcar como oficial solo tras revision del portavoz/admin.

## Recomendaciones de base de datos

Tablas a crear o evolucionar:

- `municipalities`
- `people`
- `councillors`
- `political_groups`
- `plenary_sessions`
- `committees`
- `committee_members`
- `spokespersons_boards`
- `case_files`
- `motions`
- `questions`
- `requests_for_information`
- `appearances`
- `contracts`
- `projects`
- `ordinances`
- `taxes`
- `budgets`
- `campaigns`
- `documents`
- `data_sources` o `fuentes`
- `municipal_indicators`
- `alerts`
- `political_insights`
- `government_commitments`
- `vox_program_measures`

La tabla actual `data_catalog_items` debe evolucionar para incluir:

- `importance_politica`
- `impacto_mediatico`
- `impacto_electoral`
- `frecuencia_revision`
- `responsable_validacion`
- `uso_preferente`
- `stale_policy`
- `primary_source_id`
- `fallback_source_id`

## Proximos pasos tecnicos

1. Crear migracion para añadir campos politicos a `data_catalog_items`.
2. Crear tablas `alerts` y `political_insights`.
3. Crear vista `Sala de Situacion` en el dashboard del concejal.
4. Crear pestaña `Vivienda` con PAMASA, vivienda publica, mercado, Arco de Poniente y AVS.
5. Crear pestaña `Control del Gobierno` con compromisos PP, acuerdos de pleno, contradicciones y notas de prensa.
6. Crear repositorio documental con categorias y relaciones a entidades.
7. Automatizar `poblacion_total` desde INE.
8. Preparar importacion documental de decretos de alcaldia para cargar alcalde, delegaciones, comisiones y miembros.
