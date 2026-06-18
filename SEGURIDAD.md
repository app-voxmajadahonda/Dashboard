# Seguridad operativa

## Regla principal

No guardar contrasenas, claves API, telefonos de recuperacion, codigos 2FA ni claves privadas dentro del repositorio.

Los secretos deben vivir en:

- Gestor de contrasenas.
- Variables de entorno de Vercel.
- Secretos del proveedor cloud.
- Panel seguro de Supabase, OpenAI, n8n o GitHub.

## Cuenta tecnica

La cuenta tecnica de la aplicacion debe tener:

- Contrasena unica y robusta.
- Doble factor activado.
- Email de recuperacion actualizado.
- Telefono de recuperacion actualizado.
- Codigos de recuperacion guardados fuera del repositorio.

Si una contrasena se ha compartido por chat, correo o documento no cifrado, conviene cambiarla despues de terminar las altas iniciales.

## Servicios a crear

Orden recomendado:

1. GitHub.
2. Supabase.
3. Vercel.
4. OpenAI API.
5. n8n.
6. Dominio, opcional.
7. Google Cloud, opcional para una fase posterior o si se decide desplegar ahi.

## GitHub

Usar la cuenta tecnica como propietaria o administradora del repositorio.

Recomendado:

- Repositorio privado.
- Activar doble factor.
- No subir `.env`.
- No subir claves API.
- Invitar usuarios concretos, no compartir contrasena.

## Supabase

Guardar en variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La `service role key` es especialmente sensible y no debe compartirse ni exponerse en el navegador.

## Vercel

Configurar las variables de entorno desde el panel de Vercel, no dentro del codigo.

Variables esperadas:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_ORG_SLUG`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `N8N_WEBHOOK_BASE_URL`
- `API_CLIENT_SECRET`

## OpenAI API

Crear una clave API especifica para este proyecto.

Recomendado:

- Poner limites de gasto.
- Separar proyecto/clave de otras aplicaciones.
- Rotar la clave si se sospecha exposicion.

## n8n

Usar credenciales propias por conector.

Recomendado:

- No poner secretos directamente en nodos si n8n ofrece credenciales cifradas.
- Proteger webhooks sensibles con token.
- Separar flujos de produccion y pruebas.

## Acceso de personas

No compartir la contrasena de la cuenta tecnica como forma normal de trabajo.

Modelo recomendado:

- La cuenta tecnica posee los servicios.
- Cada persona entra con su propio usuario.
- Se conceden permisos minimos necesarios.
- Se revocan accesos cuando alguien deje de colaborar.
