# Plan de arranque

## Decision inicial

La aplicacion se construira como proyecto cloud-first:

- El codigo vivira en GitHub.
- La aplicacion se desplegara en la nube desde el inicio.
- La base de datos, documentos, secretos y automatizaciones estaran en servicios cloud.
- Los ordenadores locales solo seran puestos de desarrollo.

## Paso 1: Cuentas

Crear una cuenta tecnica especifica para la aplicacion.

Nombre recomendado:

- dashboard.gm.vox@gmail.com
- app.grupomunicipal@gmail.com
- tecnologia.voxmajadahonda@gmail.com
- o una cuenta bajo dominio propio si existe.

Esta cuenta debe ser propietaria o administradora de:

- GitHub.
- Google Cloud.
- Supabase.
- n8n.
- OpenAI API.
- Dominio, si se compra uno.

La cuenta actual de Google/Drive de Vox Majadahonda se conectara despues como fuente documental, con permisos limitados.

## Paso 2: Stack recomendado para MVP

Para avanzar rapido sin perder seriedad tecnica:

- Frontend y backend: Next.js.
- Base de datos: Supabase PostgreSQL.
- Autenticacion: Supabase Auth.
- Storage documental: Supabase Storage al inicio.
- IA: OpenAI API.
- Automatizaciones: n8n.
- Despliegue: Google Cloud Run.

Motivo:

- Permite tener login, base de datos, ficheros, API, IA y despliegue rapido.
- Reduce la administracion tecnica inicial.
- Mantiene la opcion de migrar a Google Cloud mas adelante.

## Paso 3: Repositorio

Crear un repositorio privado en GitHub.

Nombre recomendado:

- dashboard-grupo-municipal
- dashboard-gm
- gm-fiscalizacion

Configuracion:

- Repositorio privado.
- Rama principal: main.
- Acceso administrativo para la cuenta tecnica.
- Acceso de desarrollo para las cuentas que vayan a trabajar con Codex.

## Paso 4: Primer MVP

El primer MVP debe resolver el nucleo, no todos los modulos:

- Login privado.
- Roles basicos: administrador, concejal, integracion API.
- Configuracion de entidad: Vox Majadahonda.
- Subida de documentos PDF.
- Almacenamiento cloud.
- Extraccion de texto.
- Extraccion IA de datos relevantes.
- Listado de acciones de gobierno detectadas.
- Busqueda y filtros.
- Exportacion simple de informe.

## Paso 5: Modelo de datos minimo

Tablas iniciales:

- organizations.
- profiles.
- memberships.
- documents.
- document_files.
- document_extractions.
- government_actions.
- audit_log.

Despues se anadiran:

- motions.
- amendments.
- committees.
- committee_sessions.
- tasks.
- sources.
- source_runs.
- api_clients.
- reports.

## Paso 6: Primer documento de prueba

Seleccionar 3 o 4 documentos reales:

- Un decreto.
- Un acuerdo de pleno.
- Un orden del dia.
- Una mocion o acta.

Objetivo:

- Probar la extraccion de texto.
- Ver si la IA identifica bien organo, fecha, acuerdos, importes, areas y tareas.
- Ajustar el modelo de datos a documentos reales.

## Paso 7: Primeras pantallas

Pantallas iniciales:

- Login.
- Dashboard.
- Documentos.
- Subir documento.
- Detalle de documento.
- Acciones de gobierno.
- Configuracion de entidad.
- Usuarios y roles.

## Lo que tiene que hacer el usuario

1. Crear la cuenta tecnica de Google.
2. Crear o autorizar una cuenta de GitHub.
3. Crear cuenta de Supabase con la cuenta tecnica.
4. Crear cuenta de OpenAI API con la cuenta tecnica.
5. Crear proyecto Google Cloud para el primer despliegue.
6. Elegir 3 o 4 documentos reales de prueba.

## Lo que puede hacer Codex

1. Crear la estructura inicial de la aplicacion.
2. Preparar el modelo de base de datos.
3. Preparar las variables de entorno.
4. Crear las primeras pantallas.
5. Crear el sistema de roles.
6. Preparar el flujo de subida documental.
7. Preparar el primer extractor IA.
8. Preparar la documentacion de despliegue.

## Orden recomendado

1. Crear cuenta tecnica.
2. Crear repositorio privado en GitHub.
3. Crear proyecto Supabase. Estado: creado desde movil.
4. Crear app Next.js.
5. Conectar Supabase Auth.
6. Crear tablas iniciales.
7. Desplegar una primera version vacia en Google Cloud Run.
8. Subir primer PDF.
9. Extraer texto.
10. Extraer datos con IA.

## Decision pendiente mas importante

Para empezar ya, la decision clave es:

Usamos Google Cloud Run + Supabase para el primer MVP.

Esta es la opcion recomendada si queremos prescindir de Vercel y mantener la infraestructura principal bajo la cuenta tecnica de Google.
