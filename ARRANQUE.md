# Plan de arranque

## Decisión inicial

La aplicación se construye como proyecto cloud-first:

- El código vive en GitHub.
- La aplicación está desplegada en Vercel.
- La base de datos, documentos, secretos y automatizaciones estarán en servicios cloud.
- Los ordenadores locales solo serán puestos de desarrollo.

## Paso 1: Cuentas

Crear una cuenta técnica específica para la aplicación.

Nombre recomendado:

- dashboard.gm.vox@gmail.com
- app.grupomunicipal@gmail.com
- tecnologia.voxmajadahonda@gmail.com
- o una cuenta bajo dominio propio si existe.

Esta cuenta debe ser propietaria o administradora de:

- GitHub.
- Vercel.
- Supabase.
- n8n.
- OpenAI API.
- Dominio, si se compra uno.

Google Cloud queda como opción futura si se decide mover infraestructura o alojar servicios auxiliares.

La cuenta actual de Google/Drive de Vox Majadahonda se conectará después como fuente documental, con permisos limitados.

## Paso 2: Stack recomendado para MVP

Para avanzar rápido sin perder seriedad técnica:

- Frontend y backend: Next.js.
- Base de datos: Supabase PostgreSQL.
- Autenticación: Supabase Auth.
- Storage documental: Supabase Storage al inicio.
- IA: OpenAI API.
- Automatizaciones: n8n.
- Despliegue: Vercel.

Motivo:

- Permite tener login, base de datos, ficheros, API, IA y despliegue rápido.
- Reduce la administración técnica inicial.
- Mantiene la opción de migrar a Google Cloud más adelante si hiciera falta.

## Paso 3: Repositorio

Crear un repositorio privado en GitHub.

Nombre recomendado:

- dashboard-grupo-municipal
- dashboard-gm
- gm-fiscalizacion

Configuración:

- Repositorio privado.
- Rama principal: main.
- Acceso administrativo para la cuenta técnica.
- Acceso de desarrollo para las cuentas que vayan a trabajar con Codex.

## Paso 4: Primer MVP

El primer MVP debe resolver el nucleo, no todos los modulos:

- Login privado.
- Roles básicos: administrador, concejal, integración API.
- Configuración de entidad: Vox Majadahonda.
- Subida de documentos PDF.
- Almacenamiento cloud.
- Extracción de texto.
- Extracción IA de datos relevantes.
- Listado de acciones de gobierno detectadas.
- Búsqueda y filtros.
- Exportación simple de informe.

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

Después se añadirán:

- motions.
- amendments.
- committees.
- committee_sessions.
- tasks.
- sources.
- source_runs.
- api_clients.
- reports.

## Paso 6: Primeros documentos de prueba

Seleccionar 3 o 4 documentos reales:

- Un decreto.
- Un acuerdo de pleno.
- Un orden del día.
- Una moción o acta.

Objetivo:

- Probar la extracción de texto.
- Ver si la IA identifica bien órgano, fecha, acuerdos, importes, áreas y tareas.
- Ajustar el modelo de datos a documentos reales.

## Paso 7: Primeras pantallas

Pantallas iniciales:

- Login.
- Dashboard.
- Documentos.
- Subir documento.
- Detalle de documento.
- Acciones de gobierno.
- Configuración de entidad.
- Usuarios y roles.

## Lo que tiene que hacer el usuario

1. Mantener controlada la cuenta técnica de la aplicación.
2. Crear o autorizar una cuenta de GitHub.
3. Mantener Supabase bajo la cuenta técnica o cuenta administradora acordada.
4. Crear cuenta de OpenAI API con la cuenta técnica.
5. Mantener Vercel conectado al repositorio.
6. Elegir 3 o 4 documentos reales de prueba.

## Lo que puede hacer Codex

1. Crear la estructura inicial de la aplicación.
2. Preparar el modelo de base de datos.
3. Preparar las variables de entorno.
4. Crear las primeras pantallas.
5. Crear el sistema de roles.
6. Preparar el flujo de subida documental.
7. Preparar el primer extractor IA.
8. Preparar la documentación de despliegue.

## Orden recomendado

1. Crear cuenta técnica.
2. Crear repositorio privado en GitHub.
3. Crear proyecto Supabase. Estado: creado.
4. Crear app Next.js.
5. Conectar Supabase Auth.
6. Crear tablas iniciales.
7. Desplegar una primera versión en Vercel. Estado: desplegado.
8. Subir primer PDF.
9. Extraer texto.
10. Extraer datos con IA.

## Situación actual

La decisión de despliegue ya está tomada para el MVP:

```text
Vercel + Supabase
```

Google Cloud queda como posible evolución futura, no como requisito para continuar ahora.
