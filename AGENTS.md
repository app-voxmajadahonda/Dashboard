# Instrucciones para Codex

## Proyecto

Dashboard Grupo Municipal para Vox Majadahonda. Aplicación Next.js con Supabase Auth/PostgreSQL/Storage, Vercel y futura integración con OpenAI/n8n.

## Comandos esperados

Cuando Node.js y npm estén disponibles:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Servicios externos

- GitHub: `app-voxmajadahonda/Dashboard`.
- Vercel: `https://dashboard-app-vox-majadahonda.vercel.app/`.
- Supabase: project ref `aylhnlyufejrhzvzkcbr`.

## Reglas de seguridad

- No guardar secretos reales en el repositorio.
- No escribir `.env`, `.env.local`, `.vercel` ni credenciales en commits.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, tokens de Vercel y tokens de Supabase deben vivir solo en proveedores, gestor de contraseñas o sesión temporal segura.
- Si se usa un token temporal para operar desde Codex, recomendar rotarlo o revocarlo al terminar.

## Flujo de Supabase

En el entorno actual, Supabase ya está conectado, las migraciones iniciales están ejecutadas, el primer administrador está creado y la creación de usuarios funciona.

Para un entorno nuevo, ejecutar migraciones en orden:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_documents_storage.sql
```

Para el primer administrador, usar la plantilla:

```text
supabase/setup_first_admin.sql
```

## Flujo de Vercel

Verificar variables con:

```text
/api/config-check
```

Variables esperadas:

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

## Prioridad técnica actual

1. Conectar dashboard a datos reales.
2. Crear subida documental a Supabase Storage.
3. Registrar documentos y ficheros en base de datos.
4. Implementar extracción de texto e IA documental.
5. Crear revisión humana de extracciones.
6. Consolidar acciones de gobierno y preparar tablas específicas para plenos, mociones, decretos, expedientes, presupuesto y alertas.
## Documento vivo de auditoria

Mantener actualizado `PLATAFORMA_VOX_MAJADAHONDA_AUDITORIA.md` cuando haya cambios relevantes en:

- arquitectura general;
- modelo de datos, migraciones o tablas Supabase;
- roles, permisos o vistas disponibles;
- dashboards, procesos y modulos funcionales;
- sistema documental, integraciones, automatizaciones o fuentes de datos;
- estado real del proyecto, problemas conocidos, roadmap o recomendaciones.

Este fichero debe servir para que un arquitecto externo pueda revisar el estado de la plataforma sin acceder al codigo fuente. Si una actualizacion cambia significativamente lo que funciona, lo que esta parcialmente implementado, lo que solo esta disenado o lo que queda pendiente, actualizar tambien este documento antes de cerrar el trabajo.
