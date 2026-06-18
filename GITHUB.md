# Vinculacion con GitHub

Repositorio remoto:

```bash
https://github.com/app-voxmajadahonda/Dashboard.git
```

Cuenta propietaria:

```bash
app-voxmajadahonda
```

Repositorio:

```bash
Dashboard
```

## Opcion A: subir desde terminal con Git

Desde la carpeta del proyecto:

```bash
git init
git branch -M main
git add .
git commit -m "Initial dashboard scaffold"
git remote add origin https://github.com/app-voxmajadahonda/Dashboard.git
git push -u origin main
```

Si GitHub pide credenciales, usar login de navegador o token personal. No usar ni pegar contrasenas dentro del repositorio.

## Opcion B: subir con GitHub Desktop

1. Instalar GitHub Desktop.
2. Iniciar sesion con `app-voxmajadahonda`.
3. Elegir `File > Add local repository`.
4. Seleccionar la carpeta:

```text
C:\Users\pperezg\OneDrive\Documentos\Dasboard GM
```

5. Si pregunta si quieres crear repositorio local, aceptar.
6. Hacer commit con mensaje:

```text
Initial dashboard scaffold
```

7. Publicar o vincular con:

```text
app-voxmajadahonda/Dashboard
```

## Opcion C: subir desde la web de GitHub

Solo recomendable si las otras opciones fallan.

1. Abrir el repositorio en GitHub.
2. Usar `Add file > Upload files`.
3. Subir todos los archivos y carpetas del proyecto.
4. Evitar subir `.env` o cualquier fichero con secretos.

## Comprobacion despues de subir

El repositorio deberia contener:

- `app/`
- `lib/`
- `supabase/`
- `package.json`
- `README.md`
- `.env.example`
- `ARQUITECTURA.md`
- `ARRANQUE.md`
- `CUENTAS.md`
- `SEGURIDAD.md`

## Siguiente paso tras subir

Conectar el repositorio a Vercel:

1. Entrar en Vercel con la cuenta tecnica.
2. Importar `app-voxmajadahonda/Dashboard`.
3. Framework: Next.js.
4. Configurar variables de entorno.
5. Desplegar.
