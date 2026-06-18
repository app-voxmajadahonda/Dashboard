# Checklist de cuentas

## Cuenta tecnica principal

Crear una cuenta especifica para la aplicacion.

Datos a guardar:

- Email.
- Telefono de recuperacion.
- Email de recuperacion.
- Persona responsable.
- Metodo de doble factor.
- Ubicacion segura de contrasena y codigos de recuperacion.

Uso:

- Propietaria de servicios cloud.
- Administradora de repositorio.
- Administradora de Supabase, Vercel/nube, n8n y OpenAI.

## GitHub

Crear repositorio privado.

Datos necesarios:

- URL del repositorio.
- Usuario/organizacion propietaria.
- Usuarios con acceso.

Configuracion recomendada:

- Repositorio privado.
- Rama principal: `main`.
- Proteccion de secretos: nunca subir `.env`.

## Supabase

Crear proyecto Supabase.

Datos necesarios:

- Project URL.
- Anon public key.
- Service role key.
- Database password.
- Region del proyecto.

Configuracion inicial:

- Activar Auth.
- Crear bucket privado `documents`.
- Ejecutar `supabase/migrations/0001_initial_schema.sql`.

Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

## OpenAI API

Crear proyecto/API key.

Datos necesarios:

- API key.
- Organizacion/proyecto.
- Limites de uso configurados.
- Metodo de pago si aplica.

Variable:

```bash
OPENAI_API_KEY=""
```

## Vercel

Crear cuenta y conectar GitHub.

Datos necesarios:

- URL de proyecto.
- Dominio temporal de Vercel.
- Variables de entorno configuradas.
- Rama de despliegue.

## n8n

Elegir n8n Cloud o n8n autohospedado.

Datos necesarios:

- URL base.
- Usuario administrador.
- Metodo de autenticacion.
- Webhooks creados.

Variable:

```bash
N8N_WEBHOOK_BASE_URL=""
```

## Google Drive Vox Majadahonda

Se conectara como fuente documental, no como propietaria tecnica de toda la infraestructura.

Datos necesarios:

- Carpetas concretas que la app podra leer.
- Cuenta que concedera permisos.
- Tipo de permisos: lectura, subida o sincronizacion.

## Dominio

Opcional al inicio.

Ideas:

- dashboardgm.es
- grupomunicipal.app
- fiscalizacionmunicipal.es

Datos necesarios:

- Registrador.
- Propietario.
- DNS.
- Dominio principal de la app.
