# Plataforma VOX Majadahonda - Auditoria funcional, tecnica y estrategica

Fecha de referencia: 23 de junio de 2026.

Este documento describe el estado actual de la plataforma sin exigir acceso al codigo fuente. Su objetivo es permitir que un arquitecto de software externo pueda auditar la aplicacion desde una perspectiva funcional, tecnica, de datos, seguridad, escalabilidad y estrategia de producto.

Actualizacion operativa incorporada el 23 de junio de 2026: se ha iniciado la conversion del MVP visual en herramienta operativa persistente mediante la migracion `0011_operational_core.sql`, tipos TypeScript, capa de datos operacional, Sala de Situacion, barra derecha conectada a Supabase y formularios minimos para crear alertas, tareas y eventos desde el panel de direccion.

Actualizacion de procesos guiados incorporada el 23 de junio de 2026: se anade `0012_guided_process_runs.sql`, carga de logo desde configuracion, uso de logo en portada/barra privada, bloque principal de procesos guiados en `/dashboard`, procesos completos para importar orden del dia de Pleno y convocatoria de comision, y bloque publico de proximos eventos institucionales.

Actualizacion de configuracion de legislatura incorporada el 23 de junio de 2026: se anade `0013_legislature_configuration.sql`, la ruta protegida `/admin/legislature`, tablas para mandato, documentos de legislatura, corporacion municipal, grupos, areas, delegaciones, comisiones y reglas ordinarias de calendario. La validacion de un documento revisado consolida datos en tablas definitivas y deja auditoria.

Actualizacion de consolidacion de legislatura incorporada el 24 de junio de 2026: `/admin/legislature` se amplia con formularios estructurados para composicion del Pleno, grupos municipales, areas de gobierno, delegaciones, comisiones, miembros de comision y reglas ordinarias de Pleno/comisiones. La activacion de legislatura valida datos minimos obligatorios y la generacion de calendario admite ano actual, legislatura completa o rango personalizado, evitando duplicados basicos.

Actualizacion de fuentes oficiales de legislatura incorporada el 24 de junio de 2026: la pantalla `/admin/legislature` incorpora enlaces del Portal de Transparencia de Majadahonda para organos de gobierno, estructura organizativa, legislatura 2023-2027, informacion general de organos de gobierno y acuerdos/decretos de organizacion. Estas fuentes se usan como referencia manual oficial para completar el marco institucional.

Actualizacion de ciclo electoral municipal incorporada el 25 de junio de 2026: se crea `lib/municipal-election-cycle.ts` para calcular elecciones municipales conforme a la regla del cuarto domingo de mayo y constitucion de la corporacion el vigesimo dia posterior segun LOREG. La pantalla `/admin/legislature` muestra los ciclos 2023, 2027 y 2031 y advierte que, con la regla vigente, 2027 corresponde al 23/05/2027 y 12/06/2027, no al 30/05/2027 y 19/06/2027.

Actualizacion de importador del Portal de Transparencia incorporada el 25 de junio de 2026: se anade `0015_transparency_portal_import.sql`, el proceso guiado `import_transparency_portal`, `system_locks`, tablas de jobs/fuentes/staging/diffs, formulario de importacion en `/admin/legislature`, crawler limitado al dominio `transparencia.majadahonda.org` y ruta de revision `/admin/legislature/transparency-imports/[jobId]`. La aplicacion definitiva de cambios queda bloqueada en esta fase y requiere una iteracion posterior.

Actualizacion de experiencia de configuracion de legislatura incorporada el 25 de junio de 2026: `/admin/legislature` deja de funcionar como formulario extenso y pasa a organizarse como proceso guiado. La parte superior muestra legislaturas registradas con la actual resaltada y detalle en ventana superpuesta; debajo queda el importador del Portal de Transparencia; y finalmente aparecen datos consolidados de la legislatura activa con correcciones manuales agrupadas en desplegables. Se anade navegacion contextual reutilizable con migas de ruta en dashboard, configuracion, legislatura, usuarios y mi ficha.

Actualizacion del flujo de importacion del Portal de Transparencia incorporada el 25 de junio de 2026: el formulario de `/admin/legislature` elimina el selector tecnico de modo y la confirmacion escrita. El flujo queda como URL editable, boton de inicio, ventana modal de confirmacion, barra de progreso durante el escaneo y ventana final con acceso a la revision de datos extraidos. El backend acepta la URL indicada y limita el crawler al mismo dominio de esa URL, preparando el uso futuro multi-municipio.

Actualizacion de revision y aplicacion de cambios de legislatura incorporada el 26 de junio de 2026: se anade `0016_legislature_change_log.sql` para trazabilidad historica de cambios institucionales dentro de una legislatura. La pantalla `/admin/legislature/transparency-imports/[jobId]` pasa a mostrar datos actuales frente a datos detectados, permite aprobar/rechazar/aplicar cambios individuales y registra fecha, usuario, dato anterior, dato nuevo, fuente y entidad afectada. La aplicacion automatica queda limitada a entidades institucionales soportadas y con campos suficientes.

## 1. Resumen ejecutivo

### Objetivo de la plataforma

La plataforma es un sistema interno de direccion politica municipal para el Grupo Municipal VOX Majadahonda durante el mandato 2023-2027. Su objetivo es convertir la actividad politica, institucional, juridica, administrativa, estrategica, documental y comunicativa del grupo municipal en procesos estructurados, medibles y reutilizables.

La aplicacion no esta orientada a ciudadanos. Es una herramienta privada para trabajo politico interno: consulta, seguimiento, fiscalizacion, carga documental, analisis de datos, alertas, tareas, control institucional y preparacion estrategica.

El diseno debe permitir exportar el producto a otros municipios. Majadahonda es la primera configuracion, no deberia ser una dependencia fija del codigo.

### Usuarios previstos

Usuarios previstos actualmente o en hoja de ruta:

| Usuario | Uso previsto |
| --- | --- |
| Concejal | Consulta de datos municipales, seguimiento institucional, observaciones, documentos, alertas, tareas y calendario. |
| Portavoz | Direccion politica, validacion de datos, configuracion municipal, revision documental, asignacion futura de tareas y aprobacion de procesos. |
| Administrador | Gestion tecnica/funcional de usuarios, roles, fuentes, datos, documentos y configuracion. |
| Responsable de comunicacion | Uso previsto para campanas, notas de prensa, redes y calendario comunicativo. |
| Asesor | Apoyo interno con permisos acotados. |
| Integracion API | Acceso tecnico futuro para sistemas externos autorizados. |

### Estado actual del desarrollo

La plataforma ya tiene una base funcional desplegable:

- Aplicacion Next.js con App Router.
- Supabase Auth para login.
- Supabase PostgreSQL como base de datos.
- Supabase Storage para documentos.
- Vercel como hosting actual previsto/activo.
- Primer modelo de roles.
- Pantalla publica con login integrado.
- Dashboard privado para portavoz/admin.
- Dashboard inicial para concejal.
- Pantalla de configuracion del municipio para admin/portavoz.
- Carga documental basica a Supabase Storage.
- Registro de documentos, ficheros y extracciones pendientes.
- Catalogo de datos inicial en Markdown y en base de datos.
- Carga manual de indicadores reales desde configuracion.
- Cache inicial para datos publicos.
- Proteccion de rutas segun rol.
- Nucleo operativo inicial persistente: alertas, tareas, calendario institucional, plenos, comisiones, mociones, solicitudes institucionales y votaciones.
- Sala de Situacion inicial en el dashboard del concejal.
- Barra derecha del concejal conectada a `alerts`, `tasks` y `calendar_events`.
- Formularios minimos para crear alertas, tareas y eventos desde `/dashboard`.
- Carga configurable del logo del grupo municipal en Supabase Storage.
- Procesos guiados iniciales para Pleno y comision, registrados en `process_runs`.
- Portada publica con proximos eventos institucionales basicos.
- Modulo inicial de configuracion de legislatura para portavoz/admin, con subida documental, revision humana, consolidacion de datos institucionales y calendario ordinario base.
- Formularios estructurados de legislatura para completar manualmente el marco institucional sin depender todavia de OCR, IA o conectores externos.
- Fuentes oficiales de legislatura visibles desde `/admin/legislature` para facilitar carga y validacion manual de datos institucionales.
- Calculo normativo del ciclo electoral municipal visible desde `/admin/legislature`.
- Importador guiado del Portal de Transparencia de Majadahonda con staging revisable y bloqueo temporal de configuracion de legislatura.
- Rediseño de `/admin/legislature` como flujo guiado: selector de legislaturas, modal de detalle, importacion oficial y datos/correcciones de la legislatura activa.
- Migas de navegacion reutilizables en cabeceras privadas para mostrar la ruta funcional del usuario.

El producto todavia esta en fase MVP ampliado. La mayor parte de los procesos politicos estan disenados o preparados, pero no implementados como flujos completos con estados, responsables, fichas individuales, automatizaciones, conectores oficiales o analisis documental real.

### Funcionalidades implementadas

- Portada publica con datos configurados del municipio, mapa de Comunidad de Madrid, Majadahonda destacada, composicion del Pleno y login.
- Login por Supabase Auth.
- Redireccion de usuarios sin sesion a login.
- Diferenciacion inicial entre concejal y admin/portavoz.
- Barra privada superior con marca, Mi ficha, Configuracion para roles autorizados y salida.
- Dashboard de concejal con estructura modular mediante desplegables.
- Barra derecha fija para alertas, tareas y calendario.
- Capa de datos del concejal que intenta leer indicadores y documentos desde Supabase.
- Fallback con datos mock cuando no existen datos reales.
- Panel de direccion para admin/portavoz con bloques de alertas, calendario, tareas, equipo, expedientes, contratos, preguntas y documentos.
- Pantalla de configuracion con:
  - cambio critico de municipio como solicitud pendiente;
  - fuentes de datos y caducidad;
  - catalogo de datos;
  - carga manual de indicadores;
  - fuentes, web y redes;
  - sincronizacion de datos publicos;
  - subida de documentacion base;
  - listado de documentos necesarios;
  - ultimos documentos base.
- Pantalla de usuarios y roles para admin/portavoz.
- Pantalla Mi ficha para usuario.
- API de creacion de usuarios.
- API de perfil.
- API de observaciones del concejal.
- API de configuracion.
- API de subida documental.
- API de indicadores.
- API de sincronizacion de datos publicos.
- Endpoints de salud y comprobacion de configuracion.

### Funcionalidades previstas

- Extraccion real de texto de PDF/DOCX/TXT.
- Extraccion estructurada con OpenAI.
- Revision humana de extracciones.
- Tablas especificas para plenos, comisiones, mociones, contratos, expedientes, votaciones, presupuestos, ordenanzas, seguridad, vivienda y programa electoral.
- Conectores oficiales con INE, Ayuntamiento, Comunidad de Madrid, Ministerio del Interior, Plataforma de Contratacion y portales de transparencia.
- Sistema real de alertas, tareas y calendario.
- Bandeja del portavoz para validar datos y observaciones.
- Procesos completos de mociones, preguntas, ruegos, solicitudes, contratos, expedientes y seguimiento del programa electoral.
- Exportaciones.
- Panel de responsable de comunicacion.
- Multi-municipio completo.
- API externa documentada.
- Automatizaciones con n8n.

### Tecnologias utilizadas

| Capa | Tecnologia |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript |
| UI | CSS global propio, lucide-react |
| Backend | Next.js API Routes / Server Components |
| Auth | Supabase Auth |
| Base de datos | Supabase PostgreSQL |
| Storage | Supabase Storage, bucket privado `documents` |
| Vector search preparado | Extension `vector` en PostgreSQL, campo `embedding vector(1536)` |
| IA prevista | OpenAI API, dependencia instalada |
| Automatizaciones previstas | n8n |
| Hosting | Vercel |
| Validacion | TypeScript, ESLint |
| Gestor de paquetes | pnpm lock presente; scripts npm |

## 2. Arquitectura general

### Frontend

El frontend esta construido con Next.js App Router. La aplicacion combina:

- Server Components para paginas privadas y lectura inicial de datos.
- Client Components para formularios interactivos.
- CSS global en `app/globals.css`.
- Componentes reutilizables en `components/`.
- Datos mock en `lib/mock/` para sostener pantallas mientras no haya datos reales.

Rutas principales:

| Ruta | Finalidad |
| --- | --- |
| `/` | Portada publica con login integrado. |
| `/login` | Login alternativo. |
| `/dashboard` | Panel privado de direccion para admin/portavoz. |
| `/concejal` | Dashboard funcional inicial del concejal. |
| `/perfil` | Ficha personal del usuario. |
| `/admin/config` | Configuracion municipal, fuentes, documentos e indicadores. |
| `/admin/users` | Alta de usuarios y roles. |
| `/admin/legislature` | Configuracion de legislatura, documentos iniciales, revision humana, composicion municipal y calendario base. |
| `/admin/legislature/transparency-imports/[jobId]` | Revision de fuentes, staging y diferencias generadas por importacion del portal de transparencia. |

### Backend

El backend vive dentro de la propia aplicacion Next.js mediante rutas API:

| Endpoint | Uso |
| --- | --- |
| `/api/health` | Salud basica. |
| `/api/config-check` | Comprobacion de variables de entorno. |
| `/api/profile` | Actualizacion de ficha de usuario. |
| `/api/concejal/observations` | Observaciones internas del concejal. |
| `/api/admin/users` | Creacion de usuarios y membresias. |
| `/api/admin/config` | Configuracion de fuentes, caducidades y cambio de municipio. |
| `/api/admin/base-documents` | Carga documental base a Storage y base de datos. |
| `/api/admin/indicators` | Carga manual de indicadores desde el catalogo de datos. |
| `/api/admin/sync-public-data` | Sincronizacion inicial de datos publicos cacheados. |

El backend usa helpers compartidos para autenticacion, permisos y lectura segura de formularios.

### Base de datos

La base de datos es Supabase PostgreSQL. Las migraciones SQL crean:

- Tipos enum para roles, tipos documentales, estados de procesamiento y estados del dato.
- Organizaciones.
- Perfiles.
- Membresias.
- Documentos.
- Ficheros documentales.
- Extracciones.
- Acciones de gobierno.
- Auditoria.
- Requisitos documentales base.
- Fuentes de datos.
- Cache de datos externos.
- Indicadores municipales.
- Observaciones del concejal.
- Marcados de relevancia.
- Catalogo de datos.
- Indices de rendimiento.
- RLS inicial.

No existe Prisma. No hay modelos Prisma en el proyecto.

### Autenticacion

La autenticacion usa Supabase Auth. El servidor obtiene el usuario con `supabase.auth.getUser()`. Si no hay usuario, se redirige a `/login`.

Los permisos funcionales se resuelven con:

- tabla `memberships`;
- organizacion por slug por defecto;
- rol del usuario en esa organizacion;
- helpers `getOrganizationContextForUser` y `requireOrganizationAdmin`.

Actualmente, `admin` y `spokesperson` pueden entrar a configuracion y dashboard de direccion. Los concejales son redirigidos a `/concejal`.

### Almacenamiento documental

Supabase Storage contiene un bucket privado llamado `documents`. La ruta de carga actual para documentacion base sigue el patron:

```text
{organization_id}/base-documents/{document_id}/{filename}
```

La subida documental crea:

- fila en `documents`;
- fichero en Storage;
- fila en `document_files`;
- fila en `document_extractions` con esquema esperado y estado pendiente;
- entrada en `audit_log`.

No hay todavia extraccion real de texto ni OCR.

### APIs externas

Integraciones actuales:

- VOX web municipal: prevista/semimplementada para notas de prensa mediante cache.
- INE: fuente identificada y verificada para poblacion, pero no automatizada todavia.
- Supabase: implementado como backend principal.

Integraciones previstas:

- INE.
- Instituto de Estadistica de la Comunidad de Madrid.
- Ayuntamiento de Majadahonda.
- Portal de Transparencia.
- Sede electronica.
- Plataforma de Contratacion del Sector Publico.
- Ministerio del Interior.
- OpenAI.
- n8n.

### Hosting previsto

El hosting actual previsto/activo es Vercel, conectado a GitHub y con Supabase como backend externo. Google Cloud queda documentado como alternativa futura, no como arquitectura actual.

### Diagrama textual

```text
Usuario
  |
  v
Vercel / Next.js
  |
  |-- Paginas publicas
  |     |-- Portada
  |     |-- Login integrado
  |
  |-- Paginas privadas
  |     |-- Dashboard concejal
  |     |-- Dashboard direccion
  |     |-- Configuracion
  |     |-- Usuarios
  |     |-- Mi ficha
  |
  |-- API Routes
        |-- Auth y permisos
        |-- Carga documental
        |-- Carga indicadores
        |-- Configuracion
        |-- Observaciones
        |-- Usuarios
        |
        v
Supabase
  |
  |-- Auth
  |-- PostgreSQL
  |     |-- organizations
  |     |-- profiles
  |     |-- memberships
  |     |-- documents
  |     |-- document_files
  |     |-- document_extractions
  |     |-- municipal_indicators
  |     |-- data_catalog_items
  |     |-- alerts
  |     |-- tasks
  |     |-- calendar_events
  |     |-- plenary_sessions
  |     |-- committees
  |     |-- committee_sessions
  |     |-- motions
  |     |-- institutional_requests
  |     |-- votes
  |     |-- process_runs
  |     |-- legislatures
  |     |-- legislature_documents
  |     |-- municipal_corporation_members
  |     |-- municipal_groups
  |     |-- government_areas
  |     |-- delegated_councillors
  |     |-- standing_committees
  |     |-- committee_memberships
  |     |-- plenary_regular_schedule
  |     |-- committee_regular_schedule
  |     |-- system_locks
  |     |-- transparency_import_jobs
  |     |-- transparency_import_sources
  |     |-- transparency_import_staging
  |     |-- transparency_import_diffs
  |     |-- data_sources
  |     |-- cached_external_data
  |     |-- audit_log
  |
  |-- Storage
        |-- bucket documents

Fuentes externas previstas
  |
  |-- INE
  |-- Ayuntamiento
  |-- Comunidad de Madrid
  |-- Ministerio del Interior
  |-- Plataforma de Contratacion
  |-- OpenAI
  |-- n8n
```

## 3. Estructura del proyecto

Arbol funcional del proyecto, excluyendo `node_modules`, `.next`, `.git`, `.pnpm-store` y ficheros geograficos masivos de `Json/`.

```text
.agents/
app/
  admin/
    config/
      page.tsx
    users/
      page.tsx
  api/
    admin/
      base-documents/
        route.ts
      config/
        route.ts
      indicators/
        route.ts
      sync-public-data/
        route.ts
      users/
        route.ts
    concejal/
      observations/
        route.ts
    config-check/
      route.ts
    health/
      route.ts
    profile/
      route.ts
  concejal/
    page.tsx
  dashboard/
    page.tsx
  login/
    page.tsx
  perfil/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  admin/
    configuration-forms.tsx
    create-user-form.tsx
  app/
    private-top-nav.tsx
  auth/
    login-form.tsx
    logout-button.tsx
  dashboard/
    councillor-observation-form.tsx
    dashboard-components.tsx
  profile/
    user-profile-form.tsx
config/
  geo/
    madrid-map.json
  municipal-profile.json
lib/
  auth/
    organization.ts
    roles.ts
  cache/
    public-data.ts
  data/
    councillor-dashboard.ts
  mock/
    councillor-dashboard.ts
  server/
    api-auth.ts
    form.ts
  supabase/
    client.ts
    server.ts
  vox/
    press.ts
  config.ts
  types.ts
scripts/
  generate-madrid-map.mjs
supabase/
  migrations/
    0001_initial_schema.sql
    0002_documents_storage.sql
    0003_configuration_documents.sql
    0004_seed_base_document_requirements.sql
    0005_data_sources_and_cache.sql
    0006_performance_indexes.sql
    0007_user_profile_settings.sql
    0008_councillor_dashboard_foundation.sql
    0009_data_freshness_controls.sql
    0010_data_catalog.sql
  apply_step_1_0003.sql
  apply_step_2_0004_0010.sql
  setup_first_admin.sql
.dockerignore
.env.example
.gitignore
.nvmrc
AGENTS.md
ARQUITECTURA.md
ARRANQUE.md
CATALOGO_DATOS.md
cloudbuild.yaml
CODEX.md
CUENTAS.md
Dockerfile
eslint.config.mjs
GITHUB.md
GOOGLE_CLOUD.md
HOJA_RUTA.md
next.config.ts
next-env.d.ts
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
PROCESOS.md
README.md
SEGURIDAD.md
SUPABASE.md
SUPABASE_ACTUALIZACION.md
tsconfig.json
tsconfig.tsbuildinfo
VERCEL.md
```

### Finalidad de cada carpeta

| Carpeta | Finalidad |
| --- | --- |
| `app/` | Rutas Next.js, paginas, layouts, APIs y CSS global. |
| `app/api/` | Backend HTTP de la aplicacion. |
| `components/` | Componentes UI reutilizables por area. |
| `config/` | Configuracion estatica del perfil municipal y mapa generado. |
| `Json/` | Datos geograficos originales importados por el usuario, no usados directamente en runtime salvo procesamiento. |
| `lib/` | Logica compartida: auth, Supabase, datos, cache, tipos y fuentes. |
| `scripts/` | Scripts auxiliares, actualmente generacion de mapa territorial. |
| `supabase/` | Migraciones SQL, scripts de aplicacion manual y setup inicial. |
| `.agents/` | Configuracion interna de agentes/Codex. |

## 4. Modelo de datos

### Tipos SQL existentes

| Tipo | Valores |
| --- | --- |
| `app_role` | `admin`, `councillor`, `api_integration`, `spokesperson`, `communications_manager`, `advisor` |
| `document_kind` | `decree`, `fiscal_ordinance`, `delegation_decree`, `rom`, `electoral_program`, `strategic_plan`, `communication_plan`, `plenary_agreement`, `government_board_agreement`, `agenda`, `minutes`, `motion`, `amendment`, `committee`, `contract`, `report`, `budget`, `agreement`, `grant`, `other` |
| `processing_status` | `uploaded`, `text_extracted`, `ai_extracted`, `needs_review`, `validated`, `failed` |
| `data_status` | `oficial`, `pendiente_validacion`, `estimado`, `interno`, `desactualizado` |

### Entidades SQL existentes

#### `organizations`

Descripcion: representa una instancia municipal/grupo municipal.

Campos principales:

- `id`
- `slug`
- `name`
- `party`
- `municipality`
- `province`
- `region`
- `municipal_website`
- `transparency_portal`
- `electronic_office`
- `contracting_authorities`
- `settings`
- `created_at`
- `updated_at`

Relaciones:

- 1:N con `memberships`.
- 1:N con `documents`.
- 1:N con `government_actions`.
- 1:N con `data_sources`.
- 1:N con `cached_external_data`.
- 1:N con `municipal_indicators`.
- 1:N con `data_catalog_items`.

Uso:

- Configuracion principal del municipio.
- Base del modelo multi-municipio.
- Guardado de fuentes y redes sociales en `settings`.

#### `profiles`

Descripcion: perfil interno vinculado a `auth.users`.

Campos:

- `id`
- `full_name`
- `email`
- `phone`
- `whatsapp`
- `position`
- `public_role`
- `social_links`
- `committees`
- `responsibilities`
- `profile_settings`
- `created_at`
- `updated_at`

Relaciones:

- 1:N con `memberships`.
- 1:N con documentos creados.
- 1:N con observaciones.

Uso:

- Ficha del usuario.
- Datos de concejal o usuario interno.
- Directorio de equipo para admin.

#### `memberships`

Descripcion: relacion usuario-organizacion-rol.

Campos:

- `id`
- `organization_id`
- `user_id`
- `role`
- `invited_email`
- `active`
- `created_at`

Relaciones:

- N:1 con `organizations`.
- N:1 con `profiles`.

Uso:

- Control de permisos.
- Separacion inicial por rol.
- Base para multi-organizacion.

#### `documents`

Descripcion: metadatos de documentos municipales o estrategicos.

Campos:

- `id`
- `organization_id`
- `kind`
- `title`
- `source_name`
- `source_url`
- `official_date`
- `governing_body`
- `processing_status`
- `created_by`
- `created_at`
- `updated_at`

Relaciones:

- N:1 con `organizations`.
- 1:N con `document_files`.
- 1:N con `document_extractions`.
- 1:N potencial con `government_actions`.
- N:1 opcional desde `municipal_indicators.source_document_id`.

Uso:

- Catalogar documentos base, presupuestos, ordenanzas, ROM, decreto de delegaciones, programa electoral y otros.

#### `document_files`

Descripcion: ficheros fisicos guardados en Supabase Storage.

Campos:

- `id`
- `document_id`
- `storage_bucket`
- `storage_path`
- `mime_type`
- `size_bytes`
- `original_filename`
- `created_at`

Relaciones:

- N:1 con `documents`.

Uso:

- Trazar cada fichero subido.
- Vincular base de datos con Storage.

#### `document_extractions`

Descripcion: resultado de extraccion de texto, resumen, IA y datos estructurados.

Campos:

- `id`
- `document_id`
- `raw_text`
- `summary`
- `structured_data`
- `model`
- `confidence`
- `embedding`
- `created_at`

Relaciones:

- N:1 con `documents`.

Uso actual:

- Se crea una extraccion pendiente al subir documentos.

Uso previsto:

- Guardar texto extraido, resumen, JSON estructurado, confianza y embedding.

#### `government_actions`

Descripcion: actuaciones de gobierno detectadas o registradas.

Campos:

- `id`
- `organization_id`
- `document_id`
- `title`
- `action_type`
- `area`
- `governing_body`
- `official_date`
- `amount`
- `third_party`
- `risk_level`
- `follow_up_status`
- `evidence`
- `created_at`
- `updated_at`

Uso:

- Tabla preparada para fiscalizacion de decretos, acuerdos y accion de gobierno.

Estado:

- Creada, pero sin flujo funcional completo en UI.

#### `audit_log`

Descripcion: registro de acciones relevantes.

Campos:

- `id`
- `organization_id`
- `actor_user_id`
- `action`
- `target_table`
- `target_id`
- `metadata`
- `created_at`

Uso:

- Auditoria de cargas documentales, cambios criticos, indicadores y observaciones.

#### `base_document_requirements`

Descripcion: documentos obligatorios o recomendados para configurar un municipio.

Campos:

- `id`
- `organization_id`
- `document_kind`
- `title`
- `description`
- `required`
- `source_preference`
- `created_at`
- `updated_at`

Uso:

- Lista en configuracion.
- Incluye ordenanzas, presupuesto, decreto de delegaciones, ROM, programa electoral, plan estrategico y plan de comunicacion.

#### `data_sources`

Descripcion: fuentes de datos configurables por organizacion.

Campos:

- `id`
- `organization_id`
- `source_key`
- `label`
- `provider`
- `source_url`
- `refresh_interval_days`
- `enabled`
- `settings`
- `created_at`
- `updated_at`

Uso:

- Definir origen de cada dato.
- Gestionar caducidad.
- Preparar automatizaciones.

#### `cached_external_data`

Descripcion: cache de respuestas o datos externos.

Campos:

- `id`
- `organization_id`
- `cache_key`
- `provider`
- `source_url`
- `payload`
- `fetched_at`
- `expires_at`
- `status`
- `error_message`
- `created_at`
- `updated_at`

Uso:

- Evitar llamadas externas en cada carga.
- Alimentar portada y futuras sincronizaciones.

#### `municipal_indicators`

Descripcion: indicadores municipales consolidados o cargados manualmente.

Campos:

- `id`
- `organization_id`
- `category`
- `indicator_key`
- `label`
- `value`
- `unit`
- `period`
- `source_name`
- `source_url`
- `source_document_id`
- `data_status`
- `confidence`
- `loaded_by`
- `source_key`
- `expires_at`
- `updated_at`
- `created_at`

Relaciones:

- N:1 con `organizations`.
- N:1 opcional con `documents`.
- N:1 opcional con `profiles`.

Uso:

- Dashboard de concejal lee esta tabla para sobrescribir KPIs mock.
- Configuracion permite cargar indicadores manualmente.
- Los datos caducados se muestran como `desactualizado`.

#### `councillor_observations`

Descripcion: observaciones internas creadas por concejales.

Campos:

- `id`
- `organization_id`
- `user_id`
- `scope`
- `target_table`
- `target_id`
- `title`
- `body`
- `visibility`
- `created_at`
- `updated_at`

Uso:

- Primer flujo real de participacion del concejal.
- Pendiente de bandeja de revision del portavoz.

#### `councillor_relevance_marks`

Descripcion: marcados de asuntos relevantes por concejal.

Campos:

- `id`
- `organization_id`
- `user_id`
- `scope`
- `target_table`
- `target_id`
- `reason`
- `created_at`

Uso:

- Preparado en base de datos.
- Sin UI funcional completa todavia.

#### `data_catalog_items`

Descripcion: inventario operativo de datos necesarios para los dashboards.

Campos:

- `id`
- `organization_id`
- `data_key`
- `display_name`
- `dashboard_tab`
- `dashboard_section`
- `data_path`
- `source_type`
- `preferred_source`
- `source_url`
- `fallback_source`
- `automation_level`
- `refresh_interval_days`
- `target_table`
- `target_indicator_key`
- `validation_role`
- `status`
- `notes`
- `created_at`
- `updated_at`

Uso:

- Mostrar catalogo en configuracion.
- Guiar carga manual de indicadores.
- Definir caducidad.
- Base para futuras automatizaciones.

### Modelos Prisma

No existen modelos Prisma. La aplicacion trabaja directamente con Supabase JS y SQL.

### Tipos TypeScript existentes

Tipos globales manuales:

```ts
AppRole =
  | "admin"
  | "councillor"
  | "api_integration"
  | "spokesperson"
  | "communications_manager"
  | "advisor";

DataStatus =
  | "oficial"
  | "pendiente_validacion"
  | "estimado"
  | "interno"
  | "desactualizado";

DocumentKind =
  | "decree"
  | "fiscal_ordinance"
  | "delegation_decree"
  | "rom"
  | "electoral_program"
  | "strategic_plan"
  | "communication_plan"
  | "plenary_agreement"
  | "government_board_agreement"
  | "agenda"
  | "minutes"
  | "motion"
  | "amendment"
  | "committee"
  | "contract"
  | "report"
  | "budget"
  | "agreement"
  | "grant"
  | "other";

ProcessingStatus =
  | "uploaded"
  | "text_extracted"
  | "ai_extracted"
  | "needs_review"
  | "validated"
  | "failed";
```

Riesgo: los tipos TypeScript son manuales y no estan generados desde Supabase. Esto puede producir divergencias entre SQL y frontend.

## 5. Catalogo de datos

### Estado actual

Existe un documento `CATALOGO_DATOS.md` y una tabla `data_catalog_items`. El catalogo ya identifica datos, pestanas, secciones, ruta de uso, fuente preferente, alternativa, nivel de automatizacion, caducidad, tabla destino y estado.

### Indicadores existentes en base de datos

El catalogo SQL inicial incluye, entre otros:

- Poblacion total.
- Evolucion de poblacion.
- Poblacion por sexo.
- Poblacion por edad.
- Edad media.
- Poblacion extranjera.
- Renta media por hogar.
- Tasa de paro.
- Centros educativos.
- Alcalde.
- Composicion del pleno.
- Concejales delegados.
- Comisiones creadas.
- Miembros de comisiones.
- Calendario de plenos.
- Plazos de mociones.
- Votaciones por grupo.
- Presupuesto total.
- Presupuesto por habitante.
- Gasto corriente por habitante.
- Deuda por habitante.
- IBI.
- IVTM.
- ICIO.
- Plusvalia.
- Tasa de basuras.
- Contratos abiertos.
- Adjudicaciones.
- Proyectos prioritarios.
- Hitos de proyectos.
- Resultados electorales 2019.
- Resultados electorales 2023.
- Evolucion electoral VOX.
- Programa electoral.
- Medidas sin iniciativa.
- Plantilla Policia Local.
- Ratio policias por 1.000 habitantes.
- Criminalidad trimestral.

### Fuentes

Fuentes ya modeladas:

- INE.
- VOX.
- Ayuntamiento.
- Portal de transparencia.
- Carga manual.
- Documentos oficiales.
- Calculos internos.

Fuentes previstas:

- Comunidad de Madrid.
- Agencia Tributaria.
- SEPE.
- Ministerio del Interior.
- Plataforma de Contratacion.
- Sede electronica.
- Portal de videoactas o plenos.

### Automatizaciones

Niveles definidos:

| Nivel | Significado |
| --- | --- |
| `automatic` | Fuente identificada como automatizable. |
| `manual` | Carga manual. |
| `document` | Requiere documento oficial y extraccion posterior. |
| `calculated` | Se calcula a partir de otros datos. |
| `pending` | Fuente pendiente de decidir o implementar. |

Automatizacion real actual:

- No hay conectores oficiales completos.
- La portada usa cache y revalidacion.
- Existe sincronizacion administrativa de datos publicos, principalmente pensada para notas VOX/cache.
- INE esta verificado como fuente para poblacion, pero no automatizado como conector operativo.

### Datos manuales

La plataforma ya permite cargar manualmente indicadores desde configuracion. Esa carga:

- parte de un item del catalogo;
- registra valor visible;
- registra valor numerico opcional;
- periodo;
- unidad;
- estado;
- confianza;
- fuente;
- URL;
- detalle;
- caducidad calculada desde el catalogo.

### Estados

Estados del dato:

- `oficial`
- `pendiente_validacion`
- `estimado`
- `interno`
- `desactualizado`

### Caducidades

El modelo permite caducidad por fuente y por item de catalogo. Ejemplos actuales:

- Poblacion: 90 dias en catalogo.
- Paro: 30 dias.
- Renta: 365 dias.
- Presupuesto: 365 dias.
- Contratacion: 7 dias.
- Criminalidad: 120 dias.
- Datos de legislatura: sin caducidad o caducidad manual por cambio institucional.

## 6. Roles y permisos

### Roles definidos

| Rol | Estado | Descripcion |
| --- | --- | --- |
| `admin` | Implementado parcialmente | Gestiona usuarios, fuentes, configuracion e indicadores. |
| `spokesperson` | Implementado parcialmente | Equivalente funcional a admin para configuracion y dashboard de direccion. |
| `councillor` | Implementado parcialmente | Accede a dashboard de concejal y ficha propia. |
| `communications_manager` | Definido, no implementado | Previsto para comunicacion y campanas. |
| `advisor` | Definido, no implementado | Previsto para apoyo interno con permisos limitados. |
| `api_integration` | Definido, no implementado | Previsto para integraciones externas. |

### Permisos actuales por rol

#### Concejal

Puede:

- Acceder a `/concejal`.
- Acceder a `/perfil`.
- Editar su ficha.
- Crear observaciones internas.
- Ver datos e indicadores disponibles para miembros.
- Ver documentos disponibles para miembros.

No puede:

- Acceder a `/dashboard`.
- Acceder a `/admin/config`.
- Acceder a `/admin/users`.
- Crear usuarios.
- Cargar indicadores desde configuracion.
- Subir documentacion base desde configuracion.

Limitacion:

- La separacion avanzada de permisos por accion todavia es basica.
- RLS permite a miembros leer bastante informacion interna; la logica fina se esta resolviendo en rutas.

#### Portavoz

Puede:

- Acceder a `/dashboard`.
- Acceder a `/admin/config`.
- Acceder a `/admin/users`.
- Gestionar configuracion municipal.
- Cargar documentos.
- Cargar indicadores.
- Gestionar fuentes.
- Solicitar cambio critico de municipio.

Limitacion:

- No existe todavia una bandeja especifica de validacion/aprobacion.
- No existe asignacion real de tareas.
- No existe panel completo de equipo.

#### Administrador

Puede:

- Lo mismo que portavoz.
- Crear usuarios.
- Ver equipo desde Mi ficha.

Limitacion:

- No hay pantalla de edicion completa de todos los perfiles.
- No hay gestion granular de permisos.

#### Responsable comunicacion

Rol definido, sin vistas especificas.

#### Asesor

Rol definido, sin vistas especificas.

#### Integracion API

Rol definido, sin endpoint publico documentado.

## 7. Dashboard del concejal

### Objetivo

El dashboard de concejal es una vista privada para consulta y seguimiento. Debe permitir ver datos relevantes del municipio, actividad institucional, contratos, fiscalidad, proyectos, analisis electoral, promesas electorales, documentos y observaciones.

### Layout actual

- Barra superior privada.
- Zona central de trabajo.
- Barra derecha fija aproximada 20% con:
  - alertas pendientes;
  - tareas pendientes;
  - calendario.
- Contenido central organizado en desplegables para evitar scroll infinito.

### Pestanas/desplegables actuales

| Seccion | Contenido actual |
| --- | --- |
| Datos generales | KPIs, evolucion poblacion, edad, servicios, ficha politica. |
| Fiscalidad y presupuesto | KPIs, evolucion presupuestaria, ordenanzas, comparativa Haciendas Locales, municipios cercanos. |
| Seguimiento de contratos | Tabla inicial de contratos, prorrogas y contratos menores. |
| Seguimiento de proyectos especiales | Tabla inicial de proyectos, expedientes e hitos. |
| Analisis electoral | Base de resultados y patrones de votacion. |
| Promesas electorales | Programa electoral y medidas sin iniciativa. |
| Control institucional | Mociones, preguntas, ruegos y solicitudes. |
| Documentos y fuentes | Documentos recientes desde base de datos o fallback. |
| Observaciones del concejal | Permisos declarados y formulario de observacion. |

### Componentes utilizados

- `KPICard`
- `ChartCard`
- `DataTable`
- `ComparisonTable`
- `EntityDetailView`
- `DocumentCard`
- `FilterBar`
- `StatusBadge`
- `SourceBadge`
- `CouncillorObservationForm`

### KPIs actuales

KPIs con posible lectura de base de datos:

- Poblacion total.
- Renta media por hogar.
- Presupuesto por habitante.
- Concejales VOX.
- Plantilla Policia Local.
- Ratio policias / 1.000 habitantes.
- Criminalidad trimestral.
- Asuntos abiertos.
- Presupuesto total.
- Gasto corriente por habitante.
- Deuda por habitante.
- Ordenanzas cargadas.

Solo algunos de estos se muestran actualmente en la pantalla visible. La capa de datos contempla mas KPIs que la pagina usa de forma parcial.

### Filtros

Hay `FilterBar` visual con botones de filtro, pero no aplica filtrado real todavia.

### Tablas

Tablas actuales:

- Servicios e infraestructuras.
- Ficha politica municipal.
- Ordenanzas fiscales.
- Comparativa con municipios cercanos.
- Contratacion.
- Proyectos.
- Analisis electoral.
- Patrones de votacion.
- Promesas electorales.
- Mociones.
- Preguntas, ruegos y solicitudes.

Muchas filas son placeholders o datos mock.

### Graficos

Graficos actuales:

- Evolucion de poblacion.
- Poblacion por edad.
- Evolucion presupuestaria.

Son graficos de barras CSS simples, no una libreria de visualizacion.

### Alertas, tareas y calendario

La barra derecha existe y es interactiva mediante desplegables, pero usa arrays estaticos en el componente. No esta conectada aun a tablas reales de alertas, tareas o eventos.

## 8. Procesos implementados

### Gestion de plenos

Estado: disenado/parcial.

Entradas previstas:

- Convocatoria.
- Orden del dia.
- Acta.
- Video.
- Mociones.
- Preguntas.
- Ruegos.
- Votaciones.
- Informe interno.

Salidas previstas:

- Ficha de pleno.
- Alertas de plazos.
- Intervenciones.
- Seguimiento posterior.
- Votaciones por grupo.

Responsables previstos:

- Portavoz.
- Concejales asignados.
- Asesores.

Estados previstos:

- convocado;
- celebrado;
- pendiente de acta;
- acta aprobada;
- seguimiento abierto;
- seguimiento cerrado.

Implementacion real:

- No hay tabla `plenos`.
- No hay ficha individual.
- Hay placeholders en dashboard y catalogo.

### Gestion de mociones

Estado: disenado/parcial.

Entradas previstas:

- Idea.
- Borrador.
- Texto registrado.
- Pleno.
- Votacion.
- Resultado.
- Seguimiento.

Salidas:

- Registro de mocion.
- Documentos asociados.
- Nota de prensa.
- Alertas de ejecucion.
- Relacion con programa electoral.

Implementacion real:

- No hay tabla `motions`.
- Hay datos mock y tipo documental `motion`.
- `government_actions` podria capturar actuaciones relacionadas, pero no es modulo de mociones.

### Expedientes

Estado: disenado.

Entradas:

- Solicitud de expediente.
- Documentacion.
- Respuesta municipal.
- Incidencias.

Salidas:

- Ficha de expediente.
- Alertas por plazos.
- Tareas.
- Preguntas o recursos.

Implementacion real:

- No hay tabla especifica.
- Hay placeholders en dashboard.

### Contratos

Estado: disenado/parcial.

Entradas:

- Portal de contratacion.
- Expedientes.
- Adjudicaciones.
- Prorrogas.
- Contratos menores.

Salidas:

- Seguimiento.
- Alertas.
- Comparativas.
- Riesgos politicos.

Implementacion real:

- Existe `document_kind = contract`.
- No hay tabla especifica de contratos.
- Hay seccion en dashboard de concejal con placeholders.

### Presupuestos

Estado: parcial.

Entradas:

- PDF/Excel de presupuesto.
- Indicadores manuales.
- Fuente oficial.

Salidas:

- KPIs.
- Comparativas.
- Evolucion anual.
- Calculos por habitante.

Implementacion real:

- Tipo documental `budget`.
- Catalogo de datos.
- Carga manual de indicadores.
- No hay tabla presupuestaria normalizada.
- No hay parser de presupuesto.

### Seguridad

Estado: disenado/parcial.

Entradas previstas:

- Plantilla Policia Local.
- Guardia Civil.
- Criminalidad Ministerio del Interior.
- Quejas vecinales.
- Contratos relacionados.

Salidas:

- KPIs de seguridad.
- Alertas politicas.
- Seguimiento de asuntos.
- Comparativas.

Implementacion real:

- Hay KPIs mock en la capa de datos.
- Algunos indicadores existen en catalogo.
- No hay pestana propia visible actualmente, aunque el concepto esta definido.

### Vivienda

Estado: disenado.

No existe implementacion especifica actual. Esta recogida en el catalogo/hoja de ruta como modulo futuro.

### Comunicacion

Estado: disenado/parcial.

Entradas:

- URL VOX municipal.
- Redes sociales.
- Plan de comunicacion.

Salidas:

- Notas de prensa en portada.
- Campanas.
- Calendario comunicativo.

Implementacion real:

- Configuracion de redes sociales.
- Tipo documental `communication_plan`.
- Fuente VOX preparada/cache.
- No hay dashboard de comunicacion.

## 9. Sistema documental

### Carga de PDFs y documentos

La carga documental base esta implementada desde `/admin/config` mediante `/api/admin/base-documents`.

Tipos admitidos:

- PDF.
- DOCX.
- DOC.
- TXT.

Tipos documentales permitidos:

- Ordenanza fiscal.
- Presupuesto.
- Decreto de delegaciones.
- ROM.
- Programa electoral.
- Plan estrategico.
- Plan de comunicacion.
- Acta.
- Orden del dia.
- Contrato.
- Informe.
- Otro.

### Extraccion de datos

Estado actual:

- No hay extraccion real.
- Al subir se crea una fila `document_extractions` con:
  - resumen "pendiente de extraccion";
  - `structured_data` con campos esperados;
  - `humanReviewRequired: true`;
  - `model: pending`.

### Indexacion

Preparado:

- `document_extractions.embedding vector(1536)`.

No implementado:

- Generacion de embeddings.
- Busqueda semantica.
- Indice vectorial especializado.

### Busqueda

No hay buscador documental real. Hay botones o texto de "buscar" en UI, sin funcionalidad completa.

### Asociacion con expedientes

No existe todavia modelo de expedientes ni relacion formal. Los documentos pueden asociarse a `government_actions` y en el futuro a expedientes/contratos/mociones.

## 10. Integraciones externas

| Integracion | Estado | Comentario |
| --- | --- | --- |
| Supabase Auth | Implementada | Login y usuario actual. |
| Supabase PostgreSQL | Implementada | Base de datos principal. |
| Supabase Storage | Implementada | Bucket privado `documents`. |
| Vercel | Implementada/prevista | Hosting de Next.js. |
| OpenAI | Prevista | Dependencia instalada, sin llamada funcional actual. |
| n8n | Prevista | Documentado, sin flujos incluidos. |
| INE | Parcial | Fuente de poblacion verificada en catalogo, sin conector operativo. |
| Web VOX municipal | Parcial | Preparada para notas/cache; no debe bloquear portada. |
| Ayuntamiento de Majadahonda | Prevista/parcial | URLs configurables; sin scraping/API real. |
| Portal de Transparencia | Prevista/parcial | URL configurable; sin ingestion real. |
| Comunidad de Madrid | Prevista | Fuente estadistica y normativa futura. |
| Ministerio del Interior | Prevista | Criminalidad trimestral, carga manual prevista. |
| Plataforma de Contratacion | Prevista | Contratos y adjudicaciones. |
| Sede electronica | Prevista/parcial | URL configurable. |
| Google Cloud | Solo alternativa | Documentado, no arquitectura vigente. |

## 11. Componentes reutilizables

### Componentes de dashboard

| Componente | Uso | Propiedades principales |
| --- | --- | --- |
| `StatusBadge` | Muestra estado del dato. | `status`. |
| `SourceBadge` | Muestra fuente, fecha, confianza y enlace. | `source`. |
| `KPICard` | Tarjeta de indicador clave. | `label`, `value`, `detail`, `icon`, `source`, `tone`. |
| `ChartCard` | Grafico de barras CSS. | `title`, `subtitle`, `data`, `source`. |
| `DataTable` | Tabla responsive. | `title`, `subtitle`, `columns`, `rows`, `source`. |
| `AlertCard` | Tarjeta de alerta. | `title`, `detail`, `priority`, `source`. |
| `DocumentCard` | Tarjeta documental. | `title`, `type`, `status`, `source`. |
| `CalendarView` | Lista de eventos. | `events`. |
| `FilterBar` | Botones visuales de filtro. | `filters`. |
| `EntityDetailView` | Detalle tipo ficha. | `title`, `details`. |
| `ComparisonTable` | Tabla comparativa municipal. | `title`, `rows`. |

### Componentes de autenticacion

| Componente | Uso |
| --- | --- |
| `LoginForm` | Formulario de login con Supabase. |
| `LogoutButton` | Cierre de sesion. |

### Componentes de administracion

| Componente | Uso |
| --- | --- |
| `ConfigurationForms` | Configuracion municipal, fuentes, catalogo, documentos e indicadores. |
| `CreateUserForm` | Alta de usuarios. |
| `OperationalForms` | Formularios minimos para crear alertas, tareas y eventos de calendario desde el panel de direccion. |
| `GuidedProcessForms` | Procesos guiados para importar ordenes del dia de Pleno y convocatorias de comision. |
| `LegislatureForms` | Configuracion de legislatura: crear mandato, importar desde Portal de Transparencia, validar legislatura, corregir datos institucionales y generar calendario. |
| `AppBreadcrumbs` | Migas de navegacion reutilizables para ubicar al usuario dentro de panel, configuracion, legislatura, usuarios y ficha personal. |
| `LogoUploadForm` | Carga del logo del grupo municipal en Supabase Storage. |
| `TransparencyImportReviewActions` | Acciones de aprobacion, rechazo, cancelacion y aplicacion bloqueada de importaciones del portal. |

### Componentes de aplicacion

| Componente | Uso |
| --- | --- |
| `PrivateTopNav` | Barra superior privada y control basico por rol. |

### Componentes de perfil

| Componente | Uso |
| --- | --- |
| `UserProfileForm` | Edicion de ficha personal. |

## 12. Estado real del proyecto

### Funciona actualmente

- Arranque de aplicacion Next.js.
- Portada publica.
- Login.
- Rutas privadas protegidas.
- Redireccion por rol basica.
- Dashboard de concejal inicial.
- Dashboard de direccion inicial.
- Configuracion municipal inicial.
- Carga documental base.
- Guardado en Storage.
- Registro de documentos.
- Creacion de extraccion pendiente.
- Creacion de usuarios.
- Edicion de perfil.
- Carga manual de indicadores.
- Catalogo de datos en base.
- Lectura de indicadores para sobrescribir KPIs.
- Tablas operativas reales para alertas, tareas, calendario y primeros procesos institucionales.
- Lectura server-side de alertas, tareas, eventos, plenos, comisiones, mociones, solicitudes y votaciones.
- Sala de Situacion inicial con estados vacios cuando aun no hay datos reales.
- Barra derecha del concejal alimentada por Supabase para alertas, tareas y calendario.
- Generacion basica de alertas por vencimientos y proximidad de hitos.
- Procesos guiados de importacion de orden del dia de Pleno y convocatoria de comision.
- Subida de logo y uso del logo en portada/barra privada.
- Ruta `/admin/legislature` protegida para configurar la legislatura.
- Creacion de legislatura y carga de documentos iniciales.
- Revision humana de documentos de legislatura mediante JSON.
- Validacion de documentos de legislatura con consolidacion inicial en tablas de concejales, grupos, areas, comisiones y calendario de Pleno.
- Generacion basica de calendario institucional a partir de reglas ordinarias de Pleno.
- Formularios estructurados para crear o sobrescribir datos de concejales, grupos, areas, delegaciones, comisiones, miembros y reglas ordinarias.
- Activacion de legislatura bloqueada por requisitos minimos obligatorios.
- Generacion de calendario institucional para plenos y comisiones con rango configurable.
- Inicio de importacion desde Portal de Transparencia con confirmacion escrita y bloqueo temporal.
- Exploracion limitada de URLs, clasificacion de fuentes, descarga documental controlada, staging y pantalla de revision.
- Pantalla `/admin/legislature` redisenada alrededor del proceso: legislaturas registradas, detalle en ventana superpuesta, importador oficial y correccion agrupada de datos activos.
- Migas de navegacion privadas para sustituir rotulos ambiguos en panel de direccion, configuracion, legislatura, usuarios y mi ficha.
- Auditoria basica de acciones.
- RLS inicial.

### Parcialmente implementado

- Multi-municipio: existe organizacion y slug, pero el cambio de municipio no reconstruye la app.
- Roles: existen, pero no hay matriz granular completa.
- Sistema documental: guarda y clasifica, pero no extrae.
- Catalogo de datos: existe, pero no alimenta todos los dashboards.
- Fuentes externas: configurables, pero no conectores completos.
- Caducidad de datos: existe en indicadores, pero falta motor de sincronizacion.
- Dashboard de concejal: estructura avanzada, datos parcialmente mock.
- Dashboard de portavoz: vista inicial con datos estaticos.
- Portada: datos configurados/cacheados, pero parte del contenido no esta sincronizado automaticamente.
- Observaciones: concejal puede crearlas, pero no hay circuito de revision.
- Formularios operativos: permiten crear alertas, tareas y eventos, pero aun no cubren plenos, mociones, solicitudes y votaciones.
- Procesos guiados: cubren Pleno y comision, pero falta historial visible y resto de procesos politicos.
- Configuracion de legislatura: ya tiene formularios estructurados, pero la edicion de registros existentes no precarga valores y la revision documental automatica sigue pendiente.
- Importador del Portal de Transparencia: existe V1 revisable, pero no aplica cambios definitivos y no usa aun OCR/IA.

### Solo disenado

- Gestion completa de plenos.
- Gestion completa de mociones.
- Gestion de comisiones.
- Gestion de expedientes.
- Seguimiento real de contratos.
- Acciones completas de cambio de estado/cierre de tareas y alertas.
- Calendario institucional editable avanzado.
- Seguridad municipal completa.
- Analisis de criminalidad.
- Vivienda.
- Comunicacion y campanas.
- Seguimiento del programa electoral.
- Comparativas fiscales reales.
- Analisis de ordenanzas frente a Haciendas Locales.
- API externa.
- n8n.
- Busqueda semantica.
- Extraccion IA documental.

### Pendiente

- Normalizar entidades politicas y administrativas.
- Implementar conectores oficiales.
- Aplicar en Supabase las migraciones `0011_operational_core.sql`, `0012_guided_process_runs.sql`, `0013_legislature_configuration.sql` y `0015_transparency_portal_import.sql` si no estan ya aplicadas.
- Completar formularios/importadores de procesos reales.
- Sustituir datos mock por datos reales.
- Disenar flujos de validacion.
- Crear formularios de alta/edicion por proceso.
- Crear fichas individuales.
- Completar motor de alertas/tareas/calendario.
- Crear pruebas automatizadas.
- Resolver encoding/mojibake en algunos documentos si es real y no solo salida de consola.
- Revisar seguridad de service role en rutas API.

## 13. Roadmap previsto

Prioridad recomendada:

1. Aplicar las migraciones `0011`, `0012`, `0013` y `0015` en Supabase si no estan ya aplicadas.
2. Completar formularios estructurados de revision de legislatura para sustituir JSON libre.
3. Consolidar permisos y matriz de roles.
4. Crear acciones de cambio de estado y cierre de alertas/tareas.
5. Crear formularios o importadores para plenos, comisiones, mociones, solicitudes y votaciones.
6. Automatizar primer dato real: poblacion INE.
7. Crear motor de caducidad/sincronizacion no bloqueante.
8. Crear fichas individuales de pleno, mocion, comision y solicitud.
9. Crear bandeja del portavoz para validar observaciones de concejales.
10. Completar carga y extraccion de texto documental.
11. Integrar OpenAI para extraccion estructurada con revision humana.
12. Crear tablas de presupuesto y ordenanzas.
13. Crear comparativa fiscal con marco legal.
14. Crear modulo de contratacion.
15. Crear modulo de seguridad y criminalidad.
16. Crear modulo de programa electoral.
17. Crear modulo de comunicacion.
18. Crear modulo de vivienda.
19. Crear automatizaciones n8n.
20. Implementar busqueda documental y semantica.
21. Preparar multi-municipio real con asistente de migracion/configuracion.

## 14. Problemas conocidos

1. Mucha informacion operativa todavia esta en mock.
2. No hay pruebas automatizadas.
3. No hay extraccion documental real.
4. No hay normalizacion de procesos clave.
5. Los dashboards combinan datos reales y placeholders.
6. El dashboard del portavoz es mas estatico que el del concejal.
7. No hay sistema real de tareas.
8. No hay sistema real de alertas.
9. No hay calendario institucional persistente.
10. No hay fichas individuales de entidades.
11. No hay tablas especificas de plenos/mociones/contratos/presupuestos.
12. No hay conectores oficiales automatizados.
13. No hay colas ni trabajos programados.
14. No hay separacion backend/frontend fuera de Next.js.
15. Uso de service role en servidor requiere auditoria estricta.
16. Tipos TypeScript manuales pueden divergir del SQL.
17. RLS inicial esta bien como base, pero no cubre reglas politicas finas.
18. No hay gestion de errores centralizada.
19. No hay observabilidad productiva.
20. No hay estrategia de backups documentada dentro de la app.
21. Los documentos cargados no se validan por contenido, solo por tipo MIME.
22. No hay antivirus/seguridad documental.
23. No hay limites de tamano/documentos visibles en la UI.
24. No hay control granular de quien puede leer cada documento.
25. No hay exportacion real.

## 15. Recomendaciones generadas por Codex

### 20 principales problemas detectados

1. El modelo de dominio politico todavia no esta materializado en tablas reales.
2. El dashboard se apoya demasiado en datos mock.
3. No existe motor de alertas persistente.
4. No existe motor de tareas persistente.
5. No existe calendario institucional persistente.
6. No existe flujo documental completo de extraccion, revision y consolidacion.
7. Las integraciones oficiales son todavia intenciones, no conectores.
8. La gestion de plenos, mociones y votaciones no tiene base relacional propia.
9. La contratacion no tiene modelo propio.
10. Presupuesto y fiscalidad carecen de tablas normalizadas.
11. El sistema de roles no tiene matriz granular por accion y entidad.
12. El panel del portavoz no esta al nivel funcional requerido.
13. No hay tests automatizados de permisos ni APIs.
14. No hay pruebas de regresion visual.
15. No hay generacion de tipos desde base de datos.
16. No hay cola de trabajos para extracciones, sincronizaciones o IA.
17. El uso de service role en API debe revisarse con cuidado.
18. No hay estrategia de tratamiento de documentos sensibles.
19. No hay trazabilidad fina de dato a pagina/articulo/documento.
20. El multi-municipio existe como concepto, pero no como producto empaquetado.

### 20 principales mejoras recomendadas

1. Crear una matriz formal de permisos por rol, accion y entidad.
2. Crear tablas `alerts`, `tasks` y `calendar_events`.
3. Conectar la barra derecha del concejal a datos reales.
4. Crear tablas `plenary_sessions`, `committees`, `motions`, `questions`, `votes`.
5. Crear fichas individuales para pleno, mocion, comision y solicitud.
6. Crear el flujo de observacion del concejal a revision del portavoz.
7. Automatizar poblacion INE como primer conector real.
8. Crear un servicio de sincronizacion de datos con caducidad.
9. Crear parser/extractor de texto documental.
10. Integrar OpenAI con esquemas JSON y revision humana.
11. Crear tablas de ordenanzas fiscales y tributos.
12. Crear tablas de presupuesto por ejercicio, capitulo, programa y area.
13. Crear modulo de contratacion con importes, adjudicatarios, plazos y organo.
14. Crear modulo de seguridad con criminalidad, Policia Local y asuntos abiertos.
15. Crear modulo de programa electoral con medidas e iniciativas asociadas.
16. Crear buscador documental textual antes de vectorial.
17. Generar tipos TypeScript desde Supabase.
18. Introducir tests de permisos y rutas criticas.
19. Introducir logs estructurados y monitorizacion.
20. Documentar despliegue, backups, restauracion y rotacion de secretos.

### Modulos que faltan

- Alertas.
- Tareas.
- Calendario institucional.
- Plenos.
- Comisiones.
- Mociones.
- Preguntas/ruegos/solicitudes.
- Votaciones.
- Expedientes.
- Contratos.
- Presupuesto.
- Ordenanzas fiscales.
- Seguridad.
- Vivienda.
- Comunicacion.
- Campanas.
- Programa electoral.
- Busqueda documental.
- Revision documental.
- Extraccion IA.
- API externa.
- Automatizaciones.
- Panel completo del portavoz.
- Panel de responsable de comunicacion.

### Procesos que deberian automatizarse

1. Actualizacion de poblacion INE.
2. Actualizacion de renta/indicadores socioeconomicos.
3. Actualizacion de paro.
4. Deteccion de nuevas notas VOX.
5. Deteccion de nuevas convocatorias de pleno.
6. Deteccion de actas y ordenes del dia.
7. Deteccion de publicaciones en portal de transparencia.
8. Deteccion de contratos y adjudicaciones.
9. Deteccion de modificaciones presupuestarias.
10. Carga periodica de criminalidad.
11. Extraccion de texto de documentos cargados.
12. Clasificacion documental.
13. Extraccion estructurada de ordenanzas.
14. Extraccion de medidas del programa electoral.
15. Generacion de alertas por vencimiento de solicitudes.
16. Generacion de alertas por datos caducados.
17. Generacion de tareas desde observaciones relevantes.
18. Generacion de resumen semanal de actividad institucional.
19. Cruce de iniciativas con programa electoral.
20. Preparacion de informes por area politica.

### Recomendacion estrategica final

La plataforma tiene una base correcta para un MVP serio: autenticacion, roles iniciales, estructura de datos, carga documental, catalogo de datos, dashboard de concejal y configuracion municipal. El riesgo principal es crecer demasiado en UI sin consolidar el modelo de datos operativo.

La siguiente fase deberia centrarse menos en nuevas pantallas y mas en tres cimientos:

1. Datos reales con caducidad y fuente.
2. Procesos persistentes con estados.
3. Validacion humana de informacion importada o extraida.

Con esos tres pilares, la aplicacion puede pasar de prototipo visual a herramienta real de direccion politica municipal.
