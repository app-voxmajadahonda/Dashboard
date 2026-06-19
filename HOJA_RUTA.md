# Hoja de ruta funcional

## Objetivo del documento

Este documento recoge decisiones, ideas, tareas y dudas funcionales de la aplicación para poder revisarlas periódicamente.

La aplicación nace para el Grupo Municipal VOX Majadahonda, pero debe diseñarse como una herramienta exportable a otros grupos municipales. Por tanto, siempre que sea razonable, los datos específicos del municipio deben ser configurables y no quedar fijados en código.

## Estado de decisión

Estados recomendados para cada punto:

- Pendiente: idea registrada, todavía sin diseñar ni implementar.
- En diseño: se está definiendo cómo debe funcionar.
- En desarrollo: se está construyendo.
- Completado: ya está disponible y probado.
- Modificado: la idea se mantiene, pero con un enfoque distinto.
- Descartado: se decide no hacerlo.

## 1. Rediseño de la zona privada

**Estado:** Pendiente

La zona privada tras el login debe cambiar de enfoque visual.

Decisiones iniciales:

- El diseño actual con barra lateral izquierda no convence.
- Las secciones principales deberían organizarse mediante menús desplegables o navegación superior/seccional.
- La estética debe ser más limpia, profesional y menos pesada.
- La información debe distribuirse por secciones operativas, no como una única pantalla densa.
- La zona privada debe parecer una herramienta de trabajo, no una portada interna.

Secciones privadas previstas:

- Inicio / Mesa del portavoz.
- Plenos.
- Mociones.
- Expedientes.
- Decretos.
- Contratos.
- Presupuesto.
- Campañas.
- Comunicación.
- Documentos.
- Calendario.
- Configuración.

## 2. Página de configuración

**Estado:** Pendiente

Debe existir una página de configuración solo accesible al portavoz y administradores.

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

**Estado:** Pendiente

La primera opción de configuración debe ser "Cambiar de municipio".

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

**Estado:** Pendiente

La configuración debe pedir las redes sociales del grupo municipal o de la organización local:

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

**Estado:** Pendiente

La configuración debe recoger URLs principales:

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

**Estado:** Pendiente

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

## 7. Ordenanzas fiscales

**Estado:** Pendiente

La configuración debe incluir un apartado para subir PDFs de ordenanzas fiscales.

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

**Estado:** Pendiente

La configuración debe permitir incorporar presupuestos municipales.

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

**Estado:** Pendiente

Debe cargarse o localizarse el decreto de delegaciones del Ayuntamiento.

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

**Estado:** Pendiente

Debe cargarse el ROM municipal o localizarse en fuente oficial.

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

## 12. Modelo documental inteligente

**Estado:** Pendiente

La app debe distinguir entre:

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

## 13. Portada pública

**Estado:** Pendiente de ampliación

La portada pública se considera aceptable por ahora, pero puede ampliarse con información de VOX por municipio.

Mejoras previstas:

- Incorporar últimas 3 o 4 notas de prensa desde la web de VOX.
- Mantener el cuadro de login visible en portada.
- Mantener datos municipales configurables.
- Evitar exceso de contenido para que siga siendo una portada limpia.

## 14. Criterio de automatización

**Estado:** Pendiente

Criterio general:

- Si un dato se puede obtener de una fuente oficial fiable, se debe automatizar.
- Si no existe fuente fiable, la app debe permitir carga documental por el portavoz/admin.
- Si el dato afecta a análisis político, jurídico o económico, debe existir revisión humana.
- Si el dato cambia con frecuencia, debe tener fecha de última actualización y fuente.

## 15. Próximas decisiones recomendadas

**Estado:** Pendiente

Antes de implementar, conviene decidir:

1. Nueva estructura de navegación privada sin barra lateral.
2. Primer diseño de la página de configuración.
3. Modelo de datos para configuración municipal.
4. Modelo de datos para documentos base.
5. Primer flujo de subida y análisis de ordenanzas fiscales.
6. Qué datos de la web de VOX se incorporan a la portada pública.
7. Qué documentos son obligatorios para considerar configurado un municipio.

