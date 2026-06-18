# Dashboard de Grupo Municipal

## Objetivo

Construir una aplicación web en la nube para gestionar, fiscalizar y hacer seguimiento de la actividad municipal de un grupo político. La primera implantación será para Vox Majadahonda, pero la aplicación debe ser parametrizable para poder reutilizarse en otros municipios o grupos municipales sin cambiar código.

La aplicación debe permitir:

- Subir y procesar documentación municipal: decretos, actas, acuerdos de pleno, acuerdos de junta de gobierno, órdenes del día, mociones, enmiendas y documentación de comisiones.
- Extraer información relevante mediante IA y almacenarla de forma estructurada.
- Consultar esa información desde un dashboard privado con roles.
- Generar informes de seguimiento y fiscalización.
- Exponer una API controlada para que otras estructuras del partido puedan consultar información autorizada.
- Conectarse con fuentes públicas como BOE, BOCM, INE, Comunidad de Madrid, plataformas de contratación y portales de transparencia municipales.
- Automatizar ingestas, avisos, resúmenes e informes mediante flujos programados.

## Principios de diseño

- Cloud-first: la aplicación debe estar desplegada en internet y disponible desde cualquier dispositivo.
- Multi-entidad: Majadahonda será una configuración, no una condición fija en el código.
- Seguridad por defecto: autenticación, roles, auditoría y separación de permisos.
- Trazabilidad documental: todo dato extraído por IA debe conservar referencia al documento, página, fecha y fuente original.
- IA asistida, no opaca: las extracciones deben poder revisarse, corregirse y validarse.
- API-first: el frontal usará la misma API que podrán usar integraciones externas autorizadas.
- Automatizaciones desacopladas: los conectores y procesos periódicos no deben estar pegados al frontal.

## Roles iniciales

### Administrador / Portavoz

Puede configurar la entidad municipal, gestionar usuarios, fuentes, credenciales, permisos, automatizaciones, informes, integraciones API y parámetros de IA.

### Concejal / Equipo municipal

Puede consultar expedientes, documentos, mociones, comisiones, tareas e informes. Puede subir documentación y participar en flujos de trabajo según permisos.

### Integración externa / API

Acceso técnico restringido mediante claves o tokens. Pensado para estructuras regionales o sistemas externos que necesiten consultar información autorizada.

En una fase posterior se puede separar "asesor", "solo lectura", "responsable de comisión" o "administrador técnico".

## Módulos funcionales

### 1. Configuración de entidad

Datos parametrizables:

- Nombre del grupo municipal.
- Municipio.
- Provincia y comunidad autónoma.
- Web municipal.
- Portal de transparencia.
- Sede electrónica.
- Órganos de contratación.
- Fuentes oficiales asociadas.
- Integrantes del grupo.
- Mandato municipal.
- Logotipo, colores y textos institucionales.

Ejemplo:

```json
{
  "entity_slug": "vox-majadahonda",
  "party": "Vox",
  "municipality": "Majadahonda",
  "province": "Madrid",
  "region": "Comunidad de Madrid",
  "municipal_website": "https://www.majadahonda.org",
  "transparency_portal": "https://www.majadahonda.org/transparencia"
}
```

### 2. Archivo documental

Permite subir, clasificar y consultar documentos.

Tipos previstos:

- Decreto.
- Acuerdo de pleno.
- Acuerdo de junta de gobierno local.
- Orden del día.
- Acta.
- Moción.
- Enmienda.
- Comisión informativa.
- Expediente de contratación.
- Informe técnico.
- Presupuesto.
- Convenio.
- Subvención.

Cada documento debe guardar:

- Entidad municipal.
- Tipo.
- Fuente.
- Fecha.
- Órgano.
- Estado de procesamiento.
- Fichero original.
- Texto extraído.
- Resumen.
- Datos estructurados extraídos.
- Evidencias: página, fragmento y referencia al documento.

### 3. Extracción con IA

Pipeline previsto:

1. Carga del documento.
2. Extracción de texto mediante OCR o parser PDF/DOCX.
3. Clasificación del documento.
4. Extracción estructurada.
5. Validación automática de calidad.
6. Revisión humana opcional.
7. Inserción en base de datos.

Entidades extraíbles:

- Acuerdos.
- Decretos.
- Mociones.
- Enmiendas.
- Propuestas.
- Votaciones.
- Importes económicos.
- Adjudicatarios.
- Contratos.
- Plazos.
- Responsables políticos o administrativos.
- Áreas municipales.
- Riesgos o puntos de fiscalización.
- Tareas sugeridas.

### 4. Seguimiento de acción de gobierno

Vista para fiscalizar:

- Qué se ha aprobado.
- Qué órgano lo aprobó.
- Cuándo.
- Con qué importe.
- Qué área lo impulsa.
- Qué empresa o tercero aparece.
- Qué plazos hay.
- Qué documentación falta.
- Qué asuntos requieren pregunta, ruego, moción, denuncia pública o petición de información.

### 5. Mociones y enmiendas

Flujo previsto:

- Registro de idea.
- Borrador.
- Revisión interna.
- Aprobación por portavoz.
- Registro oficial.
- Debate en pleno o comisión.
- Resultado.
- Seguimiento posterior.

Campos:

- Título.
- Área temática.
- Autor o responsable.
- Estado.
- Fecha límite.
- Texto.
- Documentos vinculados.
- Enmiendas recibidas o presentadas.
- Acuerdos relacionados.
- Votación.

### 6. Comisiones informativas

Permite:

- Dar de alta comisiones.
- Registrar miembros.
- Asociar concejales responsables.
- Cargar órdenes del día.
- Registrar asuntos tratados.
- Generar tareas y preguntas.
- Hacer seguimiento de acuerdos.

### 7. Tareas y seguimiento interno

Sistema ligero de trabajo:

- Tareas asignadas.
- Responsable.
- Fecha límite.
- Prioridad.
- Estado.
- Relación con documento, moción, comisión o expediente.
- Comentarios.

### 8. Informes

Informes previstos:

- Resumen semanal de acción de gobierno.
- Alertas de contratación.
- Seguimiento de mociones.
- Seguimiento de acuerdos de pleno.
- Informe de actividad del grupo municipal.
- Informe para estructura regional.
- Dossier por área: urbanismo, hacienda, seguridad, servicios sociales, etc.

Formatos:

- Vista web.
- PDF.
- Exportación CSV/XLSX.
- API.

### 9. API externa

API protegida para:

- Consultar documentos.
- Consultar acuerdos.
- Consultar mociones.
- Consultar seguimiento.
- Descargar informes.
- Recibir métricas agregadas.

Control:

- Tokens por integración.
- Permisos por endpoint.
- Registro de accesos.
- Límites de uso.

### 10. Automatizaciones

Automatizaciones previstas:

- Revisar fuentes públicas periódicamente.
- Detectar nuevas publicaciones.
- Descargar documentos.
- Lanzar procesamiento con IA.
- Notificar hallazgos relevantes.
- Generar informes programados.
- Enviar avisos por email o mensajería.
- Sincronizar datos con sistemas externos.

Herramienta candidata: n8n, desplegada en la nube y conectada a la API interna.

## Arquitectura técnica recomendada

### Opción recomendada para empezar

- Frontend: Next.js.
- Backend/API: Next.js API routes o NestJS/FastAPI si se quiere separar desde el inicio.
- Base de datos: PostgreSQL.
- Autenticación: Supabase Auth, Auth.js o Firebase Auth.
- Almacenamiento documental: Google Cloud Storage o Supabase Storage.
- IA: API de OpenAI para extracción, clasificación, resúmenes y búsqueda semántica.
- Vector search: pgvector en PostgreSQL.
- Automatizaciones: n8n.
- Cloud: Google Cloud Run para la app y servicios; Cloud SQL para PostgreSQL si no se usa Supabase.
- Observabilidad: logs cloud, alertas y auditoría interna.

### Variante más simple

- Vercel para alojar Next.js.
- Supabase para PostgreSQL, Auth, Storage y pgvector.
- n8n Cloud o n8n en un VPS.
- OpenAI API para IA.

Ventaja: arranque rápido, menos infraestructura.

Riesgo: más dependencia de servicios SaaS externos.

### Variante más institucional en Google Cloud

- Cloud Run para frontend/backend.
- Cloud SQL PostgreSQL.
- Cloud Storage.
- Secret Manager.
- Cloud Scheduler.
- Cloud Tasks o Pub/Sub.
- n8n autohospedado en Cloud Run o Compute Engine.
- OpenAI API.

Ventaja: arquitectura más controlada y profesional.

Riesgo: configuración inicial más compleja.

## Recomendación inicial

Para una primera versión útil, conviene empezar con:

- Next.js.
- Supabase: Auth, PostgreSQL, Storage y pgvector.
- n8n Cloud o n8n autohospedado.
- OpenAI API.
- Despliegue en Vercel o Google Cloud Run.

Esta combinación permite construir rápido, tener login, base de datos, almacenamiento documental, IA y automatizaciones sin dedicar semanas a infraestructura.

Si la prioridad es que todo quede bajo Google Cloud, se puede sustituir Supabase por Cloud SQL + Cloud Storage + Identity Platform, pero el primer desarrollo será más lento.

## Modelo de datos inicial

Tablas principales:

- organizations: instancia del grupo municipal.
- municipalities: datos del municipio.
- users: usuarios internos.
- memberships: relación usuario-organización-rol.
- roles: roles y permisos.
- documents: metadatos de documentos.
- document_files: ficheros originales y derivados.
- document_extractions: resultados de IA.
- government_actions: decretos, acuerdos y actuaciones extraídas.
- motions: mociones.
- amendments: enmiendas.
- committees: comisiones.
- committee_members: miembros de comisiones.
- committee_sessions: sesiones de comisión.
- tasks: tareas internas.
- reports: informes generados.
- sources: fuentes externas configuradas.
- source_runs: ejecuciones de conectores.
- api_clients: clientes externos autorizados.
- audit_log: auditoría de acciones.

## Seguridad

Medidas mínimas:

- HTTPS obligatorio.
- Login con email y contraseña.
- Opcional: doble factor para administradores.
- Roles y permisos por organización.
- Row Level Security si se usa Supabase.
- Secretos fuera del código.
- Auditoría de accesos y cambios.
- Separación entre documentos privados y datos exportables por API.
- Backups automáticos de base de datos y ficheros.

## Fuentes externas candidatas

- BOE.
- BOCM.
- INE.
- Portal de contratación del sector público.
- Plataforma de contratación de la Comunidad de Madrid.
- Portal de transparencia municipal.
- Sede electrónica municipal.
- Web municipal.
- Comunidad de Madrid.

Cada fuente debe implementarse como conector configurable, no como lógica fija de Majadahonda.

## Fases de construcción

### Fase 0: Preparación

- Elegir stack final.
- Crear cuentas necesarias.
- Crear repositorio.
- Definir modelo de datos inicial.
- Definir roles y permisos.
- Definir configuración de la primera entidad: Vox Majadahonda.

### Fase 1: MVP privado

- Login.
- Dashboard básico.
- Gestión de usuarios y roles.
- Configuración de entidad.
- Subida de documentos.
- Almacenamiento en la nube.
- Extracción básica de texto.
- Clasificación manual o semiautomática.

### Fase 2: IA documental

- Extracción estructurada de decretos, acuerdos, mociones y órdenes del día.
- Validación humana.
- Vista de trazabilidad.
- Búsqueda y filtros.
- Primeros informes.

### Fase 3: Gestión política interna

- Módulo de mociones.
- Módulo de enmiendas.
- Módulo de comisiones.
- Tareas y responsables.
- Seguimiento de acuerdos.

### Fase 4: Automatizaciones

- n8n.
- Conectores a fuentes públicas.
- Descargas periódicas.
- Alertas.
- Informes automáticos.

### Fase 5: API externa

- Clientes API.
- Tokens.
- Endpoints controlados.
- Registro de accesos.
- Documentación de API.

### Fase 6: Multi-municipio

- Plantillas de configuración.
- Alta de nuevas organizaciones.
- Separación estricta de datos.
- Parametrización de fuentes por municipio.

## Cuentas y servicios necesarios

Inicialmente:

- Cuenta de GitHub para repositorio.
- Cuenta de Vercel o Google Cloud.
- Cuenta de Supabase o proyecto equivalente en Google Cloud.
- Cuenta de OpenAI API.
- Cuenta de n8n Cloud o servidor para n8n.
- Dominio web si se quiere una URL propia.

Recomendado:

- Google Workspace o cuenta de correo institucional para usuarios.
- Gestor de secretos.
- Sistema de backups.

## Primeras decisiones pendientes

1. Elegir entre arranque rápido con Supabase/Vercel o arquitectura más pura en Google Cloud.
2. Decidir si n8n será cloud o autohospedado.
3. Definir número inicial de usuarios y roles.
4. Decidir si la app tendrá dominio propio desde el inicio.
5. Elegir primera fuente documental a automatizar.
6. Definir el primer documento real de prueba.

## Primer MVP propuesto

El primer entregable útil debería ser:

- Login privado.
- Panel de administración de entidad.
- Panel de documentos.
- Subida de PDF.
- Extracción de texto.
- Clasificación de documento.
- Extracción IA de puntos relevantes.
- Vista de "acciones de gobierno detectadas".
- Búsqueda por fecha, órgano, área, tipo e importe.
- Exportación simple a informe.

Este MVP permite validar el núcleo del producto antes de invertir en conectores complejos.

## Estrategia de cuentas cloud

La recomendacion es crear una identidad separada para la aplicacion, distinta de las cuentas personales y distinta, al menos inicialmente, de la cuenta general de Vox Majadahonda donde ya se guarda documentacion.

Cuenta propuesta:

- Correo especifico del proyecto, por ejemplo app.dashboard.gm@gmail.com o una cuenta bajo dominio propio si existe.
- Propietaria del proyecto cloud, repositorios, servicios de despliegue, base de datos, automatizaciones y claves API.
- Con acceso administrativo para el portavoz y acceso tecnico delegado cuando haga falta.
- Sin mezcla con correo personal ni Drive personal.

Ventajas:

- Facilita transferir la aplicacion a otra persona o responsable.
- Reduce el riesgo de mezclar documentacion politica, personal y tecnica.
- Permite controlar costes, cuotas y permisos de forma independiente.
- Evita que una baja, cambio de equipo o perdida de acceso personal bloquee el sistema.
- Permite auditar mejor quien entra, que toca y que credenciales usa.

La cuenta actual de Google de Vox Majadahonda puede conectarse como fuente documental, pero no conviene que sea necesariamente la propietaria tecnica de toda la infraestructura. Es mejor tratarla como un almacen externo autorizado: la app podra leer carpetas concretas, importar documentos y sincronizar informacion, manteniendo separados los permisos de operacion tecnica.

Estructura recomendada:

- Cuenta tecnica de la app: propietaria de cloud, despliegue, base de datos, n8n y secretos.
- Cuenta Google/Drive de Vox Majadahonda: fuente documental conectada con permisos limitados.
- Usuarios personales o institucionales: acceso a la aplicacion segun rol.
- API clients: acceso tecnico restringido para integraciones externas.

## Desarrollo desde varios ordenadores

El desarrollo no debe depender del ordenador local del Ayuntamiento.

Flujo recomendado:

- Codigo en GitHub.
- Despliegue automatico desde GitHub a la nube.
- Variables de entorno y secretos guardados en el proveedor cloud, nunca en el PC.
- Base de datos y ficheros siempre en servicios cloud.
- Entornos separados: desarrollo, pruebas y produccion cuando el proyecto crezca.

Asi se puede trabajar desde el sobremesa del Ayuntamiento, desde el portatil de casa o desde otro equipo usando la misma cuenta de Codex y el mismo repositorio remoto.

El ordenador local solo servira como puesto de desarrollo; la aplicacion real vivira en la nube.
