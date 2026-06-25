# Actualización de Supabase

## Estado

La aplicación necesita tener aplicadas las migraciones `0003` a `0015` para que funcionen correctamente:

- configuración documental;
- documentos base requeridos;
- fuentes y caché de datos;
- índices de rendimiento;
- ficha ampliada de usuario;
- dashboard de concejal;
- caducidad de indicadores;
- catálogo de datos;
- núcleo operativo de alertas, tareas, calendario institucional y procesos.
- procesos guiados y registro en `process_runs`.
- configuración de legislatura, documentos iniciales, composición municipal, grupos, áreas, comisiones y calendario ordinario base.
- importador del Portal de Transparencia, staging de datos, diferencias y locks temporales.

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
9. Crear otra query nueva.
10. Abrir y copiar el contenido de:

```text
supabase/migrations/0011_operational_core.sql
```

11. Ejecutar y esperar confirmación correcta.
12. Crear otra query nueva.
13. Abrir y copiar el contenido de:

```text
supabase/migrations/0012_guided_process_runs.sql
```

14. Ejecutar y esperar confirmación correcta.
15. Crear otra query nueva.
16. Abrir y copiar el contenido de:

```text
supabase/migrations/0013_legislature_configuration.sql
```

17. Ejecutar y esperar confirmación correcta.
18. Crear otra query nueva.
19. Abrir y copiar el contenido de:

```text
supabase/migrations/0015_transparency_portal_import.sql
```

20. Ejecutar y esperar confirmación correcta.

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
- `alerts`
- `tasks`
- `calendar_events`
- `plenary_sessions`
- `committees`
- `committee_sessions`
- `motions`
- `institutional_requests`
- `votes`
- `process_runs`
- `legislatures`
- `legislature_documents`
- `municipal_corporation_members`
- `municipal_groups`
- `government_areas`
- `delegated_councillors`
- `standing_committees`
- `committee_memberships`
- `plenary_regular_schedule`
- `committee_regular_schedule`
- `system_locks`
- `transparency_import_jobs`
- `transparency_import_sources`
- `transparency_import_staging`
- `transparency_import_diffs`
- columnas `source_key` y `expires_at` en `municipal_indicators`
- columna `checksum` en `document_files`

Después, la aplicación podrá usar el catálogo de datos, fuentes, caducidades y el núcleo operativo persistente.
