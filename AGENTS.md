# Instrucciones para Codex

## Proyecto

Dashboard Grupo Municipal para Vox Majadahonda. Aplicacion Next.js con Supabase Auth/PostgreSQL/Storage, Vercel y futura integracion con OpenAI/n8n.

## Comandos esperados

Cuando Node.js y npm esten disponibles:

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
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, tokens de Vercel y tokens de Supabase deben vivir solo en proveedores, gestor de contrasenas o sesion temporal segura.
- Si se usa un token temporal para operar desde Codex, recomendar rotarlo o revocarlo al terminar.

## Flujo de Supabase

Ejecutar migraciones en orden:

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

## Prioridad tecnica actual

1. Completar configuracion real de Supabase.
2. Validar login y primer administrador.
3. Conectar dashboard a datos reales.
4. Crear subida documental a Supabase Storage.
5. Implementar extraccion de texto e IA documental.
