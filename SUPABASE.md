# Configuración de Supabase

## Estado

El proyecto Supabase ya está creado, conectado a la aplicación desplegada en Vercel y con la configuración inicial operativa.

Estado actual:

- `Project URL`: `https://aylhnlyufejrhzvzkcbr.supabase.co`.
- `anon public key` / `publishable key`: configurada.
- `service role key`: configurada en Vercel como secreto.
- Migraciones iniciales: ejecutadas.
- Primer administrador: creado.
- Creación de usuarios desde `/admin/users`: funcionando.
- Bucket privado `documents`: preparado por migración.

## Datos que se pueden compartir para configurar la app

Estos dos valores son necesarios para conectar el frontend:

```env
NEXT_PUBLIC_SUPABASE_URL="https://aylhnlyufejrhzvzkcbr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGhubHl1ZmVqcmh6dnprY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Mjg2MTAsImV4cCI6MjA5NzQwNDYxMH0.MIQ1hrvo0nCcH--HJIUWd24xo_OsP_mwFDGF_kgSrDs"
```

La clave anon es pública en el sentido de que se usa desde el navegador, pero debe ir acompañada de Row Level Security en la base de datos.

## Datos que no deben compartirse por chat ni guardarse en GitHub

```env
SUPABASE_SERVICE_ROLE_KEY=""
DATABASE_PASSWORD=""
```

La `service role key` permite saltarse políticas RLS y debe tratarse como secreto crítico.

## Crear bucket documental

El bucket puede crearse ejecutando la migración:

```text
supabase/migrations/0002_documents_storage.sql
```

También se puede crear manualmente.

En Supabase:

1. Ir a `Storage`.
2. Crear bucket.
3. Nombre:

```text
documents
```

4. Tipo: privado.

Este bucket guardará PDFs, DOCX y documentos originales.

## Ejecutar migraciones iniciales

En un entorno nuevo de Supabase:

1. Ir a `SQL Editor`.
2. Crear nueva query.
3. Ejecutar, en orden, el contenido de:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_documents_storage.sql
supabase/migrations/0003_configuration_documents.sql
supabase/migrations/0004_seed_base_document_requirements.sql
supabase/migrations/0005_data_sources_and_cache.sql
supabase/migrations/0006_performance_indexes.sql
supabase/migrations/0007_user_profile_settings.sql
```

4. Ejecutar.

Las migraciones crean:

- Organizacion inicial Vox Majadahonda.
- Perfiles de usuario.
- Membresias y roles.
- Documentos.
- Ficheros.
- Extracciones IA.
- Acciones de gobierno.
- Auditoria.
- Políticas RLS iniciales.
- Bucket privado `documents`.
- Políticas de Storage para documentos por organización.
- Tipos documentales para ordenanzas fiscales, ROM y decreto de delegaciones.
- Tipos documentales para programa electoral, plan estratégico y plan de comunicación.
- Tabla `base_document_requirements` para documentación base del municipio.
- Tablas `data_sources` y `cached_external_data` para fuentes externas y caché con caducidad.
- Índices de rendimiento para documentos, acciones, auditoría, membresías y datos cacheados.
- Campos de perfil para teléfono, WhatsApp, cargo, redes, comisiones y responsabilidades.

## Después de ejecutar las migraciones

El primer usuario administrador ya está creado en el entorno actual. En un entorno nuevo, el flujo sería:

1. Ir a `Authentication > Users`.
2. Invitar o crear el usuario del portavoz/administrador.
3. Copiar el `user id`.
4. Insertar una membresía admin para la organización `vox-majadahonda`.

Plantilla disponible:

```text
supabase/setup_first_admin.sql
```

SQL orientativo:

```sql
insert into memberships (organization_id, user_id, role)
select organizations.id, 'USER_ID_AQUI'::uuid, 'admin'
from organizations
where slug = 'vox-majadahonda';
```

Cuando ese primer administrador exista, podrá entrar en:

```text
/admin/users
```

Desde ahí podrá crear otros usuarios y asignarles uno de estos roles:

- `admin`
- `councillor`
- `api_integration`

Para que la creación de usuarios funcione desde la app, Vercel debe tener configurada la variable secreta:

```text
SUPABASE_SERVICE_ROLE_KEY
```

## Problema de acceso desde red municipal

Si Supabase no abre desde la red municipal, probablemente sea por DNS/proxy.

Dominios a permitir:

- `supabase.com`
- `app.supabase.com`
- `api.supabase.com`
- `*.supabase.co`

## Próximo trabajo Supabase

1. Ejecutar las migraciones `0003`, `0004`, `0005`, `0006` y `0007` en el proyecto ya desplegado.
2. Completar extracción real de texto desde PDF/DOCX/TXT.
3. Guardar texto extraído y resultados IA en `document_extractions`.
4. Consolidar hallazgos validados en `government_actions` y futuras tablas específicas.
