# Procesos funcionales de la aplicación

Este documento define los procesos internos que debe soportar la aplicación. Sirve como puente entre la hoja de ruta y la implementación.

## 1. Panel privado de dirección

Objetivo: dar una vista diaria de trabajo al portavoz, concejales y equipo.

Bloques principales:

- Alertas.
- Calendario.
- Tareas pendientes.
- Equipo.
- Seguimiento de expedientes.
- Seguimiento de contratos.
- Preguntas de vecinos.
- Documentos a validar.

## 2. Pleno

Objetivo: preparar, ejecutar y hacer seguimiento político de cada pleno.

Partes:

- Convocatoria.
- Orden del día.
- Documentación asociada.
- Análisis político por punto.
- Preguntas, ruegos y mociones.
- Intervenciones.
- Votaciones por grupo.
- Acuerdos adoptados.
- Tareas posteriores.

Hitos:

- Orden del día recibido.
- Documentación validada.
- Preguntas asignadas.
- Intervenciones preparadas.
- Resultado de votaciones registrado.
- Seguimiento posterior creado.

## 3. Comisiones

Objetivo: organizar el trabajo previo al pleno y el control por áreas.

Partes:

- Comisión.
- Régimen de celebración.
- Integrantes.
- Orden del día.
- Documentación.
- Responsable del grupo municipal.
- Preguntas o solicitudes.
- Tareas posteriores.

## 4. Tareas y equipo

Objetivo: permitir al portavoz asignar trabajo a concejales, asesores o comunicación.

Campos mínimos:

- Título.
- Descripción.
- Responsable.
- Área.
- Prioridad.
- Fecha límite.
- Estado.
- Documento o expediente relacionado.
- Comentarios.

Estados iniciales:

- Pendiente.
- En curso.
- Bloqueada.
- Para revisar.
- Completada.

## 5. Mociones e iniciativas

Objetivo: registrar todas las iniciativas del grupo municipal y su resultado.

Datos mínimos:

- Título.
- Tipo de iniciativa.
- Fecha de registro.
- Pleno o comisión relacionada.
- Texto presentado.
- Área política.
- Medidas del programa electoral relacionadas.
- Votación por grupo.
- Resultado.
- Seguimiento posterior.

Uso:

- Saber qué se ha presentado.
- Ver qué grupos han apoyado o rechazado.
- Medir actividad política.
- Relacionar iniciativas con el programa electoral.

## 6. Programa electoral

Objetivo: cargar el programa electoral completo y convertirlo en medidas medibles.

Flujo:

1. Subir documento del programa electoral.
2. Extraer medidas completas.
3. Clasificar por área.
4. Relacionar cada medida con iniciativas, mociones, preguntas o acciones de gobierno.
5. Generar alertas si no hay actividad asociada.

Estados de medida:

- Sin iniciar.
- Iniciativa preparada.
- Presentada.
- Aprobada.
- En seguimiento.
- Cumplida.
- Bloqueada.
- Descartada.

Alertas:

- Medida sin iniciativa asociada.
- Medida relevante sin actividad reciente.
- Medida aprobada sin seguimiento.
- Medida de gobierno no cumplida.

## 7. Preguntas de vecinos

Objetivo: registrar preguntas, quejas o asuntos trasladados por vecinos y convertirlos en actividad institucional.

Datos mínimos:

- Fecha.
- Canal de entrada.
- Vecino o colectivo, si procede.
- Asunto.
- Barrio o zona.
- Área municipal.
- Responsable interno.
- Relación con expediente, pleno o comisión.
- Respuesta dada.
- Estado.

Estados:

- Recibida.
- En análisis.
- Convertida en pregunta.
- Derivada a expediente.
- Respondida.
- Cerrada.

## 8. Documentos estratégicos

Documentos que debe poder subir el portavoz/admin:

- Programa electoral.
- Plan estratégico.
- Plan de comunicación.
- Ordenanzas fiscales.
- Presupuesto municipal.
- Decreto de delegaciones.
- ROM municipal.

Principio:

Los documentos se guardan como fuente original, pero los datos útiles deben extraerse y guardarse en base de datos para no depender del PDF en cada consulta.

## 9. Coherencia visual

Las áreas principales deben compartir la misma lógica visual:

- Parte pública: presentación y acceso.
- Panel privado de dirección: control operativo diario.
- Panel de concejales: trabajo asignado, seguimiento por área y datos relevantes.
- Administración/configuración: fuentes, documentación base, usuarios y municipio.

Todas deben usar la misma identidad:

- Verde VOX como acento principal.
- Fondos claros.
- Tipografía fuerte y limpia.
- Tarjetas sobrias.
- Menús superiores.
- Información priorizada por acción, alerta y seguimiento.

## 10. Panel de concejales

Objetivo: que cada concejal tenga una vista clara de su trabajo, datos relevantes y procesos asignados.

Pestañas principales:

- Datos más relevantes.
- Análisis fiscal y presupuestario.
- Seguimiento institucional.
- Contratación.
- Programa electoral.

Principio de permisos:

- Todo dato visible para un concejal debe estar disponible también para el portavoz.
- El concejal ve su trabajo asignado y sus áreas.
- El portavoz ve todos los datos, puede tomar decisiones y puede validar/cargar información.

Procesos compartidos con portavoz:

- Tareas: el portavoz puede asignar; el concejal puede ejecutar o informar.
- Documentos: el portavoz/admin puede configurar y validar; el concejal puede consultar o proponer.
- Programa electoral: el portavoz valida estado y estrategia; el concejal trabaja iniciativas asociadas.
- Plenos/comisiones: el portavoz coordina; cada concejal prepara su parte.

## 11. Configuración de usuario

Objetivo: mantener una ficha interna útil de cada usuario/concejal.

Datos iniciales:

- Nombre.
- Email.
- Teléfono.
- WhatsApp.
- Cargo interno.
- Cargo público o responsabilidad.
- Redes sociales.
- Comisiones.
- Responsabilidades o áreas de seguimiento.
- Notas internas.

Permisos:

- Cada usuario puede acceder a su propia ficha.
- El portavoz/admin debe poder acceder a las fichas de todos.
- La edición por parte del portavoz/admin podrá ampliarse cuando se cierre el modelo de datos definitivo.
