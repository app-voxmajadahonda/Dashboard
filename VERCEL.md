# Despliegue en Vercel

## Objetivo

Usar Vercel para publicar rapidamente el primer MVP de la app desde GitHub.

Arquitectura inicial:

- GitHub: repositorio de codigo.
- Vercel: despliegue web Next.js.
- Supabase: Auth, base de datos y storage.
- OpenAI API: extraccion documental e informes.
- n8n: automatizaciones.

## Repositorio

Repositorio a importar:

```text
https://github.com/app-voxmajadahonda/Dashboard
```

Framework:

```text
Next.js
```

Rama de produccion:

```text
main
```

## Variables de entorno

Configurar en Vercel, dentro de:

```text
Project Settings > Environment Variables
```

Variables publicas:

```text
NEXT_PUBLIC_APP_NAME=Dashboard Grupo Municipal
NEXT_PUBLIC_DEFAULT_ORG_SLUG=vox-majadahonda
NEXT_PUBLIC_SUPABASE_URL=https://aylhnlyufejrhzvzkcbr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Variables secretas:

```text
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
N8N_WEBHOOK_BASE_URL=...
API_CLIENT_SECRET=...
```

No guardar variables secretas en GitHub.

## Primer despliegue

1. Entrar en Vercel.
2. Importar proyecto desde GitHub.
3. Seleccionar `app-voxmajadahonda/Dashboard`.
4. Confirmar framework `Next.js`.
5. Configurar variables de entorno conocidas.
6. Pulsar `Deploy`.

## Comprobacion

Cuando despliegue, probar:

```text
https://URL-DE-VERCEL/api/health
```

Debe responder:

```json
{
  "ok": true,
  "service": "dashboard-grupo-municipal"
}
```

Tambien probar:

```text
https://URL-DE-VERCEL/api/config-check
```

Debe indicar que estan presentes:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_ORG_SLUG`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Parte publica y parte privada

Rutas:

```text
/           Parte publica
/login      Login de usuarios
/dashboard  Dashboard privado
/admin/users Gestion de usuarios y roles
```

Proteccion:

- Supabase Auth gestiona usuarios y sesiones.
- La tabla `memberships` asigna cada usuario a una organizacion y rol.
- Los roles iniciales son `admin`, `councillor` y `api_integration`.

Para crear usuarios desde `/admin/users` hace falta configurar:

```text
SUPABASE_SERVICE_ROLE_KEY
```

La `service role key` debe configurarse solo como secreto de Vercel. No debe guardarse en GitHub.

## Dominio

Al principio se puede usar el dominio gratuito de Vercel.

Mas adelante se puede configurar un dominio propio desde:

```text
Project Settings > Domains
```

## Notas

Vercel queda como plataforma de despliegue del frontend/backend Next.js. Si mas adelante se decide volver a Google Cloud Run, el proyecto ya mantiene `Dockerfile` y `cloudbuild.yaml`.
