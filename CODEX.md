# Operación desde Codex

## Objetivo

Centralizar el desarrollo de la aplicación en Codex:

- Cambios de código en GitHub.
- Despliegues y variables en Vercel.
- Migraciones, Auth y Storage en Supabase.
- Configuración futura de OpenAI API y n8n.

Este documento no debe contener secretos reales.

## Estado de conectores

### GitHub

Repositorio:

```text
https://github.com/app-voxmajadahonda/Dashboard
```

Acción recomendada:

1. Instalar el plugin/conector de GitHub en Codex.
2. Autorizar la cuenta `app-voxmajadahonda`.
3. Conceder acceso al repositorio `Dashboard`.

Uso esperado desde Codex:

- Revisar ramas, commits y cambios.
- Crear pull requests.
- Inspeccionar errores de CI o despliegue vinculados al repositorio.
- Mantener el código sincronizado con Vercel.

### Vercel

URL publica:

```text
https://dashboard-app-vox-majadahonda.vercel.app/
```

No hay conector directo disponible en esta sesión. Para centralizar Vercel en Codex, usar una de estas opciones:

- Vercel CLI autenticado en el equipo.
- Token temporal de Vercel configurado como variable local segura.
- Sesión de navegador controlada por Codex, si el plugin de navegador está autorizado.

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

Comprobación pública:

```text
https://dashboard-app-vox-majadahonda.vercel.app/api/health
https://dashboard-app-vox-majadahonda.vercel.app/api/config-check
```

### Supabase

Proyecto:

```text
https://aylhnlyufejrhzvzkcbr.supabase.co
```

No hay conector directo disponible en esta sesión. Para centralizar Supabase en Codex, usar una de estas opciones:

- Supabase CLI autenticado con access token temporal.
- Panel web de Supabase usando navegador autorizado.
- Token temporal solo durante la sesión de configuración.

Estado actual de Supabase:

1. Proyecto conectado.
2. Migraciones iniciales ejecutadas.
3. Bucket privado `documents` preparado.
4. Primer usuario administrador creado.
5. Login verificado.
6. Acceso a `/dashboard` verificado.
7. Creación de usuarios en `/admin/users` funcionando.

Acciones siguientes:

1. Crear subida documental real a Supabase Storage.
2. Registrar metadatos en `documents` y `document_files`.
3. Implementar extracción de texto.
4. Preparar extracción IA y revisión humana.

## Credenciales necesarias

No guardar estos valores en GitHub ni en documentos del repositorio.

### GitHub

- Autorización del plugin de GitHub en Codex, o GitHub CLI autenticado.

### Vercel

- Acceso al proyecto `dashboard-app-vox-majadahonda`.
- Permiso para gestionar environment variables.
- Permiso para redeploy.

### Supabase

- `SUPABASE_SERVICE_ROLE_KEY`.
- Access token para Supabase CLI, si se usa CLI.
- Database password solo si se necesita conexión directa a PostgreSQL.

## Flujo operativo actual recomendado

1. Mantener GitHub sincronizado con Vercel.
2. Verificar `/api/config-check` después de cambios de variables.
3. Construir el módulo documental.
4. Probar subida, listado y detalle de documentos con usuarios reales.
5. Conectar extracción de texto e IA.
6. Validar los resultados antes de consolidarlos como acciones de gobierno.

## Comandos útiles si los CLI están instalados

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

- Los secretos reales viven en Vercel, Supabase, OpenAI, n8n o un gestor de contraseñas.
- El repositorio solo contiene nombres de variables y valores públicos.
- Si un token temporal se usa para configurar Codex, se debe revocar o rotar cuando termine la sesión.
