# Dashboard Grupo Municipal

Aplicacion cloud-first para seguimiento documental, fiscalizacion de accion de gobierno, mociones, comisiones, tareas e informes de un grupo municipal.

La primera configuracion sera para Vox Majadahonda, pero el proyecto esta planteado para ser multi-entidad y reutilizable en otros municipios.

## Stack inicial

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- OpenAI API
- n8n
- Google Cloud Run como despliegue recomendado

## Estado actual

Base inicial creada:

- Pantalla de dashboard.
- Estructura Next.js.
- Variables de entorno de ejemplo.
- Clientes Supabase.
- Migracion SQL inicial.
- Documentacion de arquitectura y arranque.

## Requisitos locales

Para ejecutar en un ordenador de desarrollo:

- Node.js 20 o superior.
- npm.

Instalacion:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Comprobacion:

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
/           Parte publica
/login      Login de usuarios
/dashboard  Dashboard privado
/admin/users Gestion de usuarios y roles
```

La proteccion usa Supabase Auth. Los permisos se asignan con la tabla `memberships` y los roles `admin`, `councillor` y `api_integration`.

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

Cuando el proyecto Supabase este creado:

1. Activar PostgreSQL.
2. Activar Auth.
3. Crear un bucket privado para documentos, por ejemplo `documents`.
4. Ejecutar la migracion:

```sql
supabase/migrations/0001_initial_schema.sql
```

La migracion crea:

- Organizaciones.
- Perfiles.
- Membresias y roles.
- Documentos.
- Ficheros documentales.
- Extracciones IA.
- Acciones de gobierno.
- Auditoria.
- Politicas RLS iniciales.
- Configuracion inicial de Vox Majadahonda.

## Despliegue recomendado

Primer despliegue:

1. Crear repositorio privado en GitHub.
2. Subir este proyecto.
3. Crear proyecto Google Cloud.
4. Activar Cloud Run, Cloud Build, Artifact Registry y Secret Manager.
5. Conectar el repositorio a Cloud Build.
6. Desplegar con `cloudbuild.yaml`.

Ver [GOOGLE_CLOUD.md](./GOOGLE_CLOUD.md).

## Siguientes pasos tecnicos

1. Conectar Supabase Auth.
2. Crear pantallas reales de login.
3. Crear alta de usuarios y roles.
4. Crear subida documental a Storage.
5. Extraer texto de PDF.
6. Enviar texto a OpenAI para clasificacion y extraccion.
7. Guardar acciones de gobierno detectadas.
8. Crear revision humana de extracciones.
