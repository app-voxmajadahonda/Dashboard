# Dashboard Grupo Municipal

Aplicación cloud-first para seguimiento documental, fiscalización de acción de gobierno, mociones, comisiones, tareas e informes de un grupo municipal.

La primera configuración es para Vox Majadahonda, pero el proyecto está planteado para ser multi-entidad y reutilizable en otros municipios.

## Stack inicial

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- OpenAI API
- n8n
- Vercel como despliegue actual

## Estado actual

Base inicial creada:

- Despliegue en Vercel conectado a Supabase.
- Supabase Auth configurado.
- Migraciones iniciales ejecutadas.
- Primer administrador creado.
- Creación de usuarios funcionando.
- Pantalla de dashboard.
- Estructura Next.js.
- Variables de entorno de ejemplo.
- Clientes Supabase.
- Migraciones SQL iniciales.
- Documentación de arquitectura y arranque.

## Requisitos locales

Para ejecutar en un ordenador de desarrollo:

- Node.js 20 o superior.
- npm.

Instalación:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Comprobación:

```bash
npm run typecheck
npm run lint
npm run build
```

Endpoints de salud:

```text
/api/health
/api/config-check
```

## Rutas iniciales

```text
/           Parte pública
/login      Login de usuarios
/dashboard  Dashboard privado
/concejal   Panel privado de concejales
/perfil     Configuración de usuario y ficha personal
/admin/config Configuración del municipio, fuentes y documentación base
/admin/users Gestión de usuarios y roles
/admin/legislature Configuración de legislatura, documentos base, revisión y calendario ordinario
/api/concejal/observations Observaciones internas de concejales
```

La protección usa Supabase Auth. Los permisos se asignan con la tabla `memberships` y los roles `admin`, `spokesperson`, `councillor`, `communications_manager`, `advisor` y `api_integration`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar los valores reales:

```bash
NEXT_PUBLIC_APP_NAME="Dashboard Grupo Municipal"
NEXT_PUBLIC_DEFAULT_ORG_SLUG="vox-majadahonda"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
OPENAI_API_KEY=""
N8N_WEBHOOK_BASE_URL=""
API_CLIENT_SECRET=""
```

No se deben subir secretos reales al repositorio.

## Supabase

El proyecto Supabase está creado y conectado. El flujo de base de datos previsto es:

1. Mantener Auth activo.
2. Mantener PostgreSQL activo.
3. Usar el bucket privado `documents`.
4. Ejecutar las migraciones, si se crea un entorno nuevo:

```sql
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_documents_storage.sql
supabase/migrations/0003_configuration_documents.sql
supabase/migrations/0004_seed_base_document_requirements.sql
supabase/migrations/0005_data_sources_and_cache.sql
supabase/migrations/0006_performance_indexes.sql
supabase/migrations/0007_user_profile_settings.sql
supabase/migrations/0008_councillor_dashboard_foundation.sql
supabase/migrations/0009_data_freshness_controls.sql
supabase/migrations/0010_data_catalog.sql
supabase/migrations/0011_operational_core.sql
supabase/migrations/0012_guided_process_runs.sql
supabase/migrations/0013_legislature_configuration.sql
```

Las migraciones crean:

- Organizaciones.
- Perfiles.
- Membresias y roles.
- Documentos.
- Ficheros documentales.
- Extracciones IA.
- Acciones de gobierno.
- Auditoría.
- Políticas RLS iniciales.
- Bucket privado `documents`.
- Configuración inicial de Vox Majadahonda.
- Documentos base requeridos para configurar un municipio.
- Tipos documentales para ordenanzas fiscales, ROM y decreto de delegaciones.
- Tipos documentales para programa electoral, plan estratégico y plan de comunicación.
- Fuentes externas configurables y caché de datos con caducidad.
- Índices iniciales para acelerar documentos, acciones, auditoría y dashboards.
- Campos ampliados de ficha de usuario/concejal.
- Base de indicadores municipales, observaciones y marcados relevantes del concejal.
- Controles de fuente y caducidad para indicadores municipales.
- Catálogo inicial de datos, fuentes, rutas, automatización, caducidad y destino en base de datos.
- Vista del catálogo y carga manual de indicadores reales desde configuración.
- Núcleo operativo real: alertas, tareas, calendario institucional, plenos, comisiones, mociones, solicitudes y votaciones.
- Procesos guiados registrados en `process_runs` para importar ordenes del dia de Pleno y convocatorias de comision.
- Configuración de legislatura: mandato, documentos iniciales, composición municipal, grupos, áreas, delegaciones, comisiones, miembros, reglas ordinarias y calendario institucional base con revisión humana.

Para actualizar el Supabase ya desplegado, ver [SUPABASE_ACTUALIZACION.md](./SUPABASE_ACTUALIZACION.md).

## Despliegue

El despliegue actual está en Vercel:

```text
https://dashboard-app-vox-majadahonda.vercel.app/
```

Vercel despliega desde GitHub y usa Supabase para Auth, PostgreSQL y Storage. Ver [VERCEL.md](./VERCEL.md).

Google Cloud queda como opción futura si se decide mover infraestructura o servicios auxiliares. Ver [GOOGLE_CLOUD.md](./GOOGLE_CLOUD.md).

## Operación desde Codex

Para centralizar el desarrollo, despliegues y configuración de servicios desde Codex, ver [CODEX.md](./CODEX.md).

## Hoja de ruta funcional

Las decisiones, ideas y tareas funcionales pendientes se registran en [HOJA_RUTA.md](./HOJA_RUTA.md).

La definición de procesos de trabajo se recoge en [PROCESOS.md](./PROCESOS.md).

El catálogo inicial de datos, fuentes, caducidades y responsables de validación se recoge en [CATALOGO_DATOS.md](./CATALOGO_DATOS.md).

## Rendimiento y carga de datos

La portada pública se revalida periódicamente y lee datos ya cacheados en PostgreSQL, no fuentes externas en cada carga. Las páginas privadas se mantienen dinámicas porque dependen del usuario autenticado y de sus permisos.

Las rutas de servidor comparten helpers de autenticación y lectura de formularios para reducir duplicidades y evitar diferencias de permisos entre módulos.

## Siguientes pasos técnicos

1. Ejecutar las migraciones `0003` a `0010` en Supabase.
2. Revisar [CATALOGO_DATOS.md](./CATALOGO_DATOS.md) y añadir/corregir datos municipales.
3. Cargar los primeros indicadores reales desde `/admin/config`.
4. Automatizar el primer indicador real: población INE.
5. Completar extracción de texto de PDF/DOCX/TXT.
6. Enviar texto a OpenAI para clasificación y extracción estructurada.
7. Crear revisión humana de extracciones.
8. Aplicar `0013_legislature_configuration.sql` y completar la configuración inicial de legislatura desde `/admin/legislature`.
9. Sustituir progresivamente la revisión JSON de documentos por formularios de revisión asistida y extracción documental real.
