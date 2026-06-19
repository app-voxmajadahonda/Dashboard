# Google Cloud Run

## Objetivo

Desplegar la aplicacion sin Vercel, usando Google Cloud como plataforma principal de ejecucion.

Arquitectura:

- GitHub: repositorio de codigo.
- Google Cloud Run: ejecucion de la app Next.js.
- Artifact Registry: imagen Docker.
- Cloud Build: construccion y despliegue desde GitHub.
- Secret Manager: secretos.
- Supabase: base de datos, auth y storage.
- n8n: automatizaciones.

## Cuenta recomendada

Usar la cuenta tecnica de la aplicacion, no una cuenta personal.

## Proyecto Google Cloud

Crear un proyecto dedicado.

Nombre sugerido:

```text
dashboard-gm
```

ID sugerido si esta disponible:

```text
dashboard-gm-vox-majadahonda
```

Region recomendada:

```text
europe-southwest1
```

Esta region es Madrid. Si algun servicio no esta disponible ahi, usar:

```text
europe-west1
```

## APIs a activar

Activar:

- Cloud Run API.
- Cloud Build API.
- Artifact Registry API.
- Secret Manager API.
- IAM Service Account Credentials API.

## Artifact Registry

Crear repositorio Docker.

Nombre:

```text
dashboard
```

Region:

```text
europe-southwest1
```

Formato:

```text
Docker
```

## Cloud Run

Servicio:

```text
dashboard-gm
```

Puerto:

```text
8080
```

Acceso:

```text
Allow unauthenticated
```

Aunque el servicio sea publico, la app tendra login interno. Cloud Run publico solo significa que la pagina puede cargar desde internet.

## Secret Manager

Crear secretos:

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

Valores publicos ya conocidos:

```text
NEXT_PUBLIC_APP_NAME=Dashboard Grupo Municipal
NEXT_PUBLIC_DEFAULT_ORG_SLUG=vox-majadahonda
NEXT_PUBLIC_SUPABASE_URL=https://aylhnlyufejrhzvzkcbr.supabase.co
```

La `NEXT_PUBLIC_SUPABASE_ANON_KEY` es publica para el frontend, pero se configura igualmente como variable de entorno.

No subir secretos a GitHub.

## Conexion con GitHub

Opcion recomendada:

1. Ir a Cloud Build.
2. Conectar repositorio GitHub.
3. Seleccionar:

```text
app-voxmajadahonda/Dashboard
```

4. Crear trigger para rama:

```text
main
```

5. Usar el archivo:

```text
cloudbuild.yaml
```

El trigger construira la imagen Docker y desplegara Cloud Run.

## Variables en Cloud Run

En Cloud Run, configurar variables de entorno. Las publicas pueden ir como variables normales:

```text
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_DEFAULT_ORG_SLUG
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Las sensibles deben venir desde Secret Manager:

```text
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
N8N_WEBHOOK_BASE_URL
API_CLIENT_SECRET
```

## Primer despliegue manual

Si no usamos trigger aun:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Comprobacion

Cuando Cloud Run despliegue, probar:

```text
https://URL-DE-CLOUD-RUN/api/health
```

Debe devolver:

```json
{
  "ok": true,
  "service": "dashboard-grupo-municipal"
}
```

## Costes

Cloud Run puede ser muy barato al inicio porque escala a cero si no hay trafico.

Vigilar:

- Cloud Run.
- Artifact Registry.
- Cloud Build.
- Logs.
- Supabase.
- OpenAI API.
- n8n.

## Siguiente paso

Despues del primer despliegue:

1. Configurar dominio propio.
2. Activar HTTPS gestionado.
3. Conectar Supabase Auth.
4. Crear login real.
5. Proteger rutas privadas.
