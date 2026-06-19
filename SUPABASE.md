# Configuracion de Supabase

## Estado

El proyecto Supabase ya ha sido creado desde el movil porque la red municipal parece bloquear o resolver mal Supabase.

Pendiente:

- Obtener `Project URL`. Estado: `https://aylhnlyufejrhzvzkcbr.supabase.co`.
- Obtener `anon public key` / `publishable key`. Estado: configurada.
- Guardar `service role key` en gestor de contrasenas.
- Guardar `database password` en gestor de contrasenas.
- Crear bucket privado `documents`. Estado: preparado en migracion.
- Ejecutar migraciones iniciales.

## Datos que se pueden compartir para configurar la app

Estos dos valores son necesarios para conectar el frontend:

```env
NEXT_PUBLIC_SUPABASE_URL="https://aylhnlyufejrhzvzkcbr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGhubHl1ZmVqcmh6dnprY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4Mjg2MTAsImV4cCI6MjA5NzQwNDYxMH0.MIQ1hrvo0nCcH--HJIUWd24xo_OsP_mwFDGF_kgSrDs"
```

La clave anon es publica en el sentido de que se usa desde el navegador, pero debe ir acompanada de Row Level Security en la base de datos.

## Datos que no deben compartirse por chat ni guardarse en GitHub

```env
SUPABASE_SERVICE_ROLE_KEY=""
DATABASE_PASSWORD=""
```

La `service role key` permite saltarse politicas RLS y debe tratarse como secreto critico.

## Crear bucket documental

El bucket puede crearse ejecutando la migracion:

```text
supabase/migrations/0002_documents_storage.sql
```

Tambien se puede crear manualmente.

En Supabase:

1. Ir a `Storage`.
2. Crear bucket.
3. Nombre:

```text
documents
```

4. Tipo: privado.

Este bucket guardara PDFs, DOCX y documentos originales.

## Ejecutar migraciones iniciales

En Supabase:

1. Ir a `SQL Editor`.
2. Crear nueva query.
3. Ejecutar, en orden, el contenido de:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_documents_storage.sql
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
- Politicas RLS iniciales.
- Bucket privado `documents`.
- Politicas de Storage para documentos por organizacion.

## Despues de ejecutar las migraciones

Crear el primer usuario administrador:

1. Ir a `Authentication > Users`.
2. Invitar o crear el usuario del portavoz/administrador.
3. Copiar el `user id`.
4. Insertar una membresia admin para la organizacion `vox-majadahonda`.

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

Cuando ese primer administrador exista, podra entrar en:

```text
/admin/users
```

Desde ahi podra crear otros usuarios y asignarles uno de estos roles:

- `admin`
- `councillor`
- `api_integration`

Para que la creacion de usuarios funcione desde la app, Vercel debe tener configurada la variable secreta:

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
