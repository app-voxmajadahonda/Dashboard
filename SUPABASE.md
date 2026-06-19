# Configuracion de Supabase

## Estado

El proyecto Supabase ya ha sido creado desde el movil porque la red municipal parece bloquear o resolver mal Supabase.

Pendiente:

- Obtener `Project URL`. Estado: `https://aylhnlyufejrhzvzkcbr.supabase.co`.
- Obtener `anon public key` / `publishable key`. Estado: configurada.
- Guardar `service role key` en gestor de contrasenas.
- Guardar `database password` en gestor de contrasenas.
- Crear bucket privado `documents`.
- Ejecutar migracion inicial.

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

En Supabase:

1. Ir a `Storage`.
2. Crear bucket.
3. Nombre:

```text
documents
```

4. Tipo: privado.

Este bucket guardara PDFs, DOCX y documentos originales.

## Ejecutar migracion inicial

En Supabase:

1. Ir a `SQL Editor`.
2. Crear nueva query.
3. Copiar el contenido de:

```text
supabase/migrations/0001_initial_schema.sql
```

4. Ejecutar.

La migracion crea:

- Organizacion inicial Vox Majadahonda.
- Perfiles de usuario.
- Membresias y roles.
- Documentos.
- Ficheros.
- Extracciones IA.
- Acciones de gobierno.
- Auditoria.
- Politicas RLS iniciales.

## Despues de ejecutar la migracion

Crear el primer usuario administrador:

1. Ir a `Authentication > Users`.
2. Invitar o crear el usuario del portavoz/administrador.
3. Copiar el `user id`.
4. Insertar una membresia admin para la organizacion `vox-majadahonda`.

SQL orientativo:

```sql
insert into memberships (organization_id, user_id, role)
select organizations.id, 'USER_ID_AQUI'::uuid, 'admin'
from organizations
where slug = 'vox-majadahonda';
```

## Problema de acceso desde red municipal

Si Supabase no abre desde la red municipal, probablemente sea por DNS/proxy.

Dominios a permitir:

- `supabase.com`
- `app.supabase.com`
- `api.supabase.com`
- `*.supabase.co`
