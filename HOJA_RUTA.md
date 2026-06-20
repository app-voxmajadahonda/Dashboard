# Hoja de ruta funcional

## Objetivo del documento

Este documento recoge decisiones, ideas, tareas y dudas funcionales de la aplicación para poder revisarlas periódicamente.

La aplicación nace para el Grupo Municipal VOX Majadahonda, pero debe diseñarse como una herramienta exportable a otros grupos municipales. Por tanto, siempre que sea razonable, los datos específicos del municipio deben ser configurables y no quedar fijados en código.

La definición operativa de procesos se desarrolla en [PROCESOS.md](./PROCESOS.md).

## Estado de decisión

Estados recomendados para cada punto:

- Pendiente: idea registrada, todavía sin diseñar ni implementar.
- En diseño: se está definiendo cómo debe funcionar.
- En desarrollo: se está construyendo.
- Completado: ya está disponible y probado.
- Modificado: la idea se mantiene, pero con un enfoque distinto.
- Descartado: se decide no hacerlo.

## 1. Rediseño de la zona privada

**Estado:** En desarrollo

La zona privada tras el login debe cambiar de enfoque visual.

Primera versión implementada:

- Sustituida la barra lateral por navegación superior con menús desplegables.
- Creado un panel privado de dirección más limpio y distribuido por bloques operativos.
- Pendiente revisar visualmente con el usuario y ajustar el diseño definitivo.

Decisiones iniciales:

- El diseño actual con barra lateral izquierda no convence.
- Las secciones principales deberían organizarse mediante menús desplegables o navegación superior/seccional.
- La estética debe ser más limpia, profesional y menos pesada.
- La información debe distribuirse por secciones operativas, no como una única pantalla densa.
- La zona privada debe parecer una herramienta de trabajo, no una portada interna.

Secciones privadas previstas:

- Inicio / Panel privado de dirección.
- Plenos.
- Comisiones.
- Mociones.
- Programa electoral.
- Expedientes.
- Decretos.
- Contratos.
- Presupuesto.
- Preguntas de vecinos.
- Campañas.
- Comunicación.
- Documentos.
- Calendario.
- Configuración.

## 2. Página de configuración

**Estado:** En desarrollo

Debe existir una página de configuración solo accesible al portavoz y administradores.

Primera versión implementada:

- Ruta `/admin/config`.
- Acceso limitado a usuarios con rol `admin`.
- Formularios para fuentes oficiales, redes sociales y documentación base.
- Carga inicial de documentos base en Supabase Storage.

Esta página será una pieza central de la aplicación y se irá ampliando conforme se definan nuevas fuentes, documentos y variables.

Objetivos:

- Configurar las variables principales del municipio.
- Configurar fuentes oficiales y enlaces relevantes.
- Subir documentación base necesaria para análisis.
- Preparar la aplicación para exportarse a otros municipios.
- Distinguir entre datos obtenibles por API/fuente pública y datos que debe aportar el portavoz.

Apartados iniciales:

- Municipio y entidad política.
- Redes sociales del grupo municipal.
- Fuentes institucionales.
- Documentación normativa y presupuestaria.
- Organización municipal.
- Automatizaciones y fuentes de datos.

## 3. Cambio de municipio

**Estado:** En desarrollo

La primera opción de configuración debe ser "Cambiar de municipio".

Primera versión implementada:

- Formulario crítico en `/admin/config`.
- Requiere confirmación escribiendo `CAMBIAR MUNICIPIO`.
- No aplica el cambio automáticamente; registra una solicitud pendiente en configuración.
- Deja auditoría de la solicitud.

Este cambio se considera crítico porque puede alterar toda la configuración de la aplicación:

- Nombre del municipio.
- Grupo municipal.
- Datos demográficos.
- Composición del pleno.
- Alcaldía y equipo de gobierno.
- Fuentes oficiales.
- Ordenanzas.
- Presupuestos.
- Plenos y comisiones.
- Datos públicos de la portada.
- Estrategia de comunicación y seguimiento.

Requisitos de seguridad:

- Debe mostrar advertencias claras antes de aplicarse.
- Debe requerir confirmación explícita.
- Debe explicar qué datos pueden cambiar o quedar pendientes de revisión.
- Debe abrir un proceso guiado de rediseño/configuración.
- Debe evitar cambios accidentales.
- Debe dejar trazabilidad de quién lo ejecuta y cuándo.

Idea pendiente de diseño:

- Asistente de cambio de municipio por pasos.
- Vista previa antes de aplicar.
- Copia de seguridad o snapshot de configuración anterior.
- Confirmación escribiendo el nombre del nuevo municipio.

## 4. Redes sociales y presencia digital

**Estado:** En desarrollo

La configuración debe pedir las redes sociales del grupo municipal o de la organización local:

Primera versión implementada:

- Campos configurables para X, Instagram, Facebook y Telegram.
- Se guardan en `organizations.settings.socialLinks`.

- X / Twitter.
- Instagram.
- Facebook.
- Telegram.
- Otras redes futuras.

Uso previsto:

- Mostrar enlaces internos.
- Alimentar módulos de comunicación.
- Cruzar actividad institucional con comunicación política.
- Preparar campañas y seguimiento de mensajes.

## 5. Fuentes institucionales del municipio

**Estado:** En desarrollo

La configuración debe recoger URLs principales:

Primera versión implementada:

- Web oficial del Ayuntamiento.
- Portal de transparencia.
- Sede electrónica.
- Página VOX del municipio.

- Web oficial del Ayuntamiento.
- Portal de transparencia.
- Sede electrónica.
- Perfil del contratante.
- Portal de plenos o videoactas, si existe.
- Boletines o tablones oficiales municipales.

Uso previsto:

- Automatizar consultas.
- Detectar nuevas publicaciones.
- Alimentar alertas.
- Evitar carga manual si existe una fuente fiable.

## 6. Fuente pública de VOX por municipio

**Estado:** En diseño

Existe una fuente interesante en la web de VOX:

```text
https://www.voxespana.es/tag/majadahonda
```

Donde `majadahonda` debería sustituirse por el nombre del municipio.

Información potencialmente útil:

- Concejales de VOX.
- Coordinador local.
- Redes sociales locales.
- Últimas notas de prensa.
- Enlaces de actualidad política.

Uso previsto:

- Mostrar las 3 o 4 últimas notas de prensa en la portada pública antes del login.
- Alimentar el módulo de comunicación.
- Ayudar a configurar datos básicos del grupo municipal.

Pendiente:

- Comprobar si la estructura de la página es estable.
- Decidir si se consume en tiempo real o se sincroniza periódicamente.
- Valorar scraping, RSS si existe, API o carga manual asistida.
- La URL ya puede guardarse desde configuración.

## 7. Ordenanzas fiscales

**Estado:** En desarrollo

La configuración debe incluir un apartado para subir PDFs de ordenanzas fiscales.

Primera versión implementada:

- Subida desde `/admin/config`.
- Registro en `documents`.
- Guardado de fichero en bucket privado `documents`.
- Registro en `document_files`.
- Clasificación por tipo documental.
- Creación de extracción pendiente en `document_extractions`.
- Auditoría de la carga.

Pendiente:

- Extracción real de texto.
- Extracción estructurada con OpenAI.
- Revisión humana y consolidación de datos en tablas específicas.

Flujo previsto:

1. El portavoz/admin sube uno o varios PDFs.
2. La app guarda los documentos en Supabase Storage.
3. La app clasifica cada documento.
4. La app extrae texto y datos relevantes.
5. La app guarda los datos estructurados en la base de datos.
6. La app permite revisión humana.
7. La app usa los datos ya guardados, sin tener que volver a extraerlos del PDF cada vez.

Datos relevantes posibles:

- Nombre de la ordenanza.
- Tipo de tasa, impuesto o precio público.
- Hecho imponible.
- Sujetos obligados.
- Tarifas.
- Bonificaciones.
- Exenciones.
- Fechas de aprobación o entrada en vigor.
- Referencias normativas.
- Artículos clave.

Decisión técnica pendiente:

- Extracción de texto local/OCR.
- Clasificación con OpenAI.
- Extracción estructurada con OpenAI usando esquema JSON.
- Guardado en tablas específicas.
- Revisión humana antes de consolidar.

## 8. Presupuestos municipales

**Estado:** En desarrollo

La configuración debe permitir incorporar presupuestos municipales.

Primera versión implementada:

- Tipo documental de presupuesto disponible en carga de documentación base.
- Pendiente modelo específico de datos presupuestarios.

Fuentes posibles:

- API o portal de transparencia, si existe.
- PDF o Excel oficial.
- Documentación aportada por el portavoz.

Uso previsto:

- Seguimiento presupuestario.
- Control de modificaciones de crédito.
- Comparativas por áreas.
- Detección de partidas sensibles.
- Argumentarios políticos.

Pendiente:

- Definir tablas de presupuesto.
- Definir datos mínimos a extraer.
- Decidir si se empieza por carga documental o por fuente oficial.

## 9. Decreto de delegaciones

**Estado:** En desarrollo

Debe cargarse o localizarse el decreto de delegaciones del Ayuntamiento.

Primera versión implementada:

- Tipo documental específico `delegation_decree`.
- Subida disponible desde configuración.
- Pendiente extracción estructurada de áreas y competencias.

Uso previsto:

- Saber qué concejal o área tiene competencias sobre cada materia.
- Relacionar expedientes, contratos, decretos y preguntas con el responsable político.
- Mejorar alertas y análisis institucional.

Datos a extraer:

- Alcaldía.
- Tenencias de alcaldía.
- Concejalías delegadas.
- Áreas de gobierno.
- Competencias por área.
- Fechas de nombramiento o modificación.

## 10. ROM municipal y régimen de funcionamiento

**Estado:** En desarrollo

Debe cargarse el ROM municipal o localizarse en fuente oficial.

Primera versión implementada:

- Tipo documental específico `rom`.
- Subida disponible desde configuración.
- Pendiente extracción de régimen de plenos, comisiones y plazos.

Uso previsto:

- Entender régimen de plenos.
- Entender comisiones informativas.
- Determinar plazos de mociones, ruegos, preguntas y solicitudes.
- Alimentar calendario político.
- Generar alertas automáticas de preparación.

Datos a extraer:

- Periodicidad de plenos.
- Comisiones existentes.
- Régimen de convocatoria.
- Plazos de presentación.
- Derechos de información.
- Funcionamiento de juntas, comisiones y órganos colegiados.

## 11. Comisiones municipales

**Estado:** Pendiente

La app debe permitir crear y configurar comisiones municipales.

Datos a configurar:

- Nombre de la comisión.
- Área o materias.
- Periodicidad.
- Integrantes.
- Representantes del grupo municipal.
- Régimen de convocatoria.
- Documentación asociada.

Uso previsto:

- Calendario.
- Preparación de preguntas.
- Seguimiento de expedientes.
- Alertas por orden del día.

## 12. Tareas y equipo

**Estado:** En diseño

Debe existir una sección donde el portavoz pueda asignar tareas a concejales, asesores y responsables de comunicación.

Datos iniciales:

- Título.
- Descripción.
- Responsable.
- Área.
- Prioridad.
- Fecha límite.
- Documento, expediente, pleno o comisión relacionada.
- Estado.

Uso previsto:

- Convertir alertas en trabajo asignado.
- Repartir preparación de plenos y comisiones.
- Seguir compromisos políticos.
- Controlar carga de trabajo del equipo.

## 13. Mociones, iniciativas y votaciones

**Estado:** En diseño

Debe registrarse toda iniciativa presentada por el grupo municipal, incluyendo mociones, preguntas, ruegos y propuestas.

Datos iniciales:

- Título.
- Tipo de iniciativa.
- Texto presentado.
- Pleno o comisión.
- Fecha de registro.
- Área política.
- Relación con programa electoral.
- Votación de cada grupo.
- Resultado.
- Seguimiento posterior.

## 14. Programa electoral

**Estado:** En desarrollo

Debe poder cargarse el programa electoral completo y extraer sus medidas para hacer seguimiento político.

Primera versión implementada:

- Tipo documental `electoral_program`.
- Subida disponible desde configuración.
- Extracción pendiente preparada con campos esperados.

Alertas futuras:

- Medidas sin iniciativa asociada.
- Medidas relevantes sin actividad reciente.
- Medidas aprobadas sin seguimiento.
- Medidas incumplidas si el grupo está en gobierno.

## 15. Preguntas de vecinos

**Estado:** En diseño

Debe existir una sección para registrar preguntas, quejas o asuntos trasladados por vecinos.

Uso previsto:

- Convertir asuntos vecinales en preguntas al pleno o comisiones.
- Asociarlos a expedientes o áreas municipales.
- Dar seguimiento a respuestas.
- Detectar temas recurrentes por barrio o materia.

## 16. Modelo documental inteligente

**Estado:** En desarrollo

La app debe distinguir entre:

Primera versión implementada:

- Documentos subidos manualmente.
- Documentos clasificados por tipo.
- Ficheros originales guardados.
- Extracciones pendientes con datos esperados y revisión humana obligatoria.

- Documentos subidos manualmente.
- Documentos obtenidos por fuente oficial.
- Documentos sincronizados por automatización.
- Documentos ya analizados.
- Documentos pendientes de revisión.

Principios:

- No reextraer datos de PDFs cada vez que se necesiten.
- Guardar resultados estructurados en base de datos.
- Mantener enlace al documento original.
- Mantener trazabilidad de extracción.
- Requerir revisión humana en datos sensibles.

Tipos documentales iniciales:

- Ordenanzas fiscales.
- Presupuestos.
- Decreto de delegaciones.
- ROM.
- Actas de pleno.
- Órdenes del día.
- Decretos.
- Expedientes.
- Contratos.
- Programa electoral.
- Plan estratégico.
- Plan de comunicación.

## 17. Portada pública

**Estado:** En desarrollo

La portada pública se considera aceptable por ahora, pero puede ampliarse con información de VOX por municipio.

Mejoras previstas:

- Incorporar últimas 3 o 4 notas de prensa desde la web de VOX.
- Mantener el cuadro de login visible en portada.
- Mantener datos municipales configurables.
- Evitar exceso de contenido para que siga siendo una portada limpia.

Primera versión implementada:

- Fuente VOX del municipio configurada en el perfil municipal.
- La portada intenta mostrar las últimas notas publicadas.
- Si la fuente externa falla, la portada no se rompe.

## 18. Criterio de automatización

**Estado:** Pendiente

Criterio general:

- Si un dato se puede obtener de una fuente oficial fiable, se debe automatizar.
- Si no existe fuente fiable, la app debe permitir carga documental por el portavoz/admin.
- Si el dato afecta a análisis político, jurídico o económico, debe existir revisión humana.
- Si el dato cambia con frecuencia, debe tener fecha de última actualización y fuente.

## 19. Próximas decisiones recomendadas

**Estado:** Pendiente

Antes de implementar, conviene decidir:

1. Nueva estructura de navegación privada sin barra lateral.
2. Primer diseño de la página de configuración.
3. Modelo de datos para configuración municipal.
4. Modelo de datos para documentos base.
5. Primer flujo de subida y análisis de ordenanzas fiscales.
6. Qué datos de la web de VOX se incorporan a la portada pública.
7. Qué documentos son obligatorios para considerar configurado un municipio.
