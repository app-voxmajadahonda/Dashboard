# Actualización de Supabase

## Estado

La aplicación necesita tener aplicadas las migraciones `0003` a `0010` para que funcionen correctamente:

- configuración documental;
- documentos base requeridos;
- fuentes y caché de datos;
- índices de rendimiento;
- ficha ampliada de usuario;
- dashboard de concejal;
- caducidad de indicadores;
- catálogo de datos.

## Cómo ejecutarlo

En Supabase:

1. Entrar en el proyecto `aylhnlyufejrhzvzkcbr`.
2. Ir a `SQL Editor`.
3. Crear una nueva query.
4. Abrir y copiar el contenido de:

```text
supabase/apply_step_1_0003.sql
```

5. Ejecutar y esperar confirmación correcta.
6. Crear otra query nueva.
7. Abrir y copiar el contenido de:

```text
supabase/apply_step_2_0004_0010.sql
```

8. Ejecutar y esperar confirmación correcta.

## Por qué son dos pasos

La migración `0003` añade nuevos valores al tipo `document_kind`. La migración `0004` usa esos valores para insertar datos.

En PostgreSQL conviene confirmar primero la migración `0003` antes de usar los nuevos valores. Por eso la actualización está separada en dos scripts.

## Después de actualizar

Comprobar en Supabase que existen estas tablas o columnas:

- `base_document_requirements`
- `data_sources`
- `cached_external_data`
- `municipal_indicators`
- `councillor_observations`
- `councillor_relevance_marks`
- `data_catalog_items`
- columnas `source_key` y `expires_at` en `municipal_indicators`

Después, la aplicación podrá usar el catálogo de datos, fuentes y caducidades.
