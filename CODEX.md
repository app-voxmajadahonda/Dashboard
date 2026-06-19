# Operacion desde Codex

## Objetivo

Centralizar el desarrollo de la aplicacion en Codex:

- Cambios de codigo en GitHub.
- Despliegues y variables en Vercel.
- Migraciones, Auth y Storage en Supabase.
- Configuracion futura de OpenAI API y n8n.

Este documento no debe contener secretos reales.

## Estado de conectores

### GitHub

Repositorio:

```text
https://github.com/app-voxmajadahonda/Dashboard
```

Accion recomendada:

1. Instalar el plugin/conector de GitHub en Codex.
2. Autorizar la cuenta `app-voxmajadahonda`.
3. Conceder acceso al repositorio `Dashboard`.

Uso esperado desde Codex:

- Revisar ramas, commits y cambios.
- Crear pull requests.
- Inspeccionar errores de CI o despliegue vinculados al repositorio.
- Mantener el codigo sincronizado con Vercel.

### Vercel

URL publica:

```text
https://dashboard-app-vox-majadahonda.vercel.app/
```

No hay conector directo disponible en esta sesion. Para centralizar Vercel en Codex, usar una de estas opciones:

- Vercel CLI autenticado en el equipo.
- Token temporal de Vercel configurado como variable local segura.
- Sesion de navegador controlada por Codex, si el plugin de navegador esta autorizado.

Variables que deben existir en Vercel:

```text
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_DEFAULT_ORG_SLUG
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
N8N_WEBHOOK_BASE_URL
API_CLIENT_SECRET
```

Comprobacion publica:

```text
https://dashboard-app-vox-majadahonda.vercel.app/api/health
https://dashboard-app-vox-majadahonda.vercel.app/api/config-check
```

### Supabase

Proyecto:

```text
https://aylhnlyufejrhzvzkcbr.supabase.co
```

No hay conector directo disponible en esta sesion. Para centralizar Supabase en Codex, usar una de estas opciones:

- Supabase CLI autenticado con access token temporal.
- Panel web de Supabase usando navegador autorizado.
- Token temporal solo durante la sesion de configuracion.

Acciones pendientes de Supabase:

1. Ejecutar `supabase/migrations/0001_initial_schema.sql`.
2. Crear bucket privado `documents`.
3. Crear el primer usuario administrador en Auth.
4. Insertar su membresia `admin` para `vox-majadahonda`.
5. Verificar login en `/login`.
6. Verificar acceso a `/dashboard`.
7. Verificar creacion de usuarios en `/admin/users`.

## Credenciales necesarias

No guardar estos valores en GitHub ni en documentos del repositorio.

### GitHub

- Autorizacion del plugin de GitHub en Codex, o GitHub CLI autenticado.

### Vercel

- Acceso al proyecto `dashboard-app-vox-majadahonda`.
- Permiso para gestionar environment variables.
- Permiso para redeploy.

### Supabase

- `SUPABASE_SERVICE_ROLE_KEY`.
- Access token para Supabase CLI, si se usa CLI.
- Database password solo si se necesita conexion directa a PostgreSQL.

## Primer flujo operativo recomendado

1. Autorizar GitHub en Codex.
2. Configurar Vercel con variables de entorno.
3. Ejecutar la migracion inicial en Supabase.
4. Crear el bucket `documents`.
5. Crear el primer admin.
6. Redeploy en Vercel.
7. Probar `/api/config-check`, `/login`, `/dashboard` y `/admin/users`.

## Comandos utiles si los CLI estan instalados

Estos comandos son orientativos. No deben ejecutarse con secretos pegados en el historial si se puede evitar.

```bash
vercel env ls
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

```bash
supabase login
supabase link --project-ref aylhnlyufejrhzvzkcbr
supabase db push
```

## Politica de secretos

- Los secretos reales viven en Vercel, Supabase, OpenAI, n8n o un gestor de contrasenas.
- El repositorio solo contiene nombres de variables y valores publicos.
- Si un token temporal se usa para configurar Codex, se debe revocar o rotar cuando termine la sesion.
