# Contribución y desarrollo

Este documento describe el flujo de trabajo de desarrollo para `manager/gestor`
usando como fuente de verdad `package.json` y los archivos de entorno presentes
en el proyecto. También resume los scripts disponibles, la configuración de
entorno y el estado actual de las pruebas.

## Resumen rápido

La aplicación se ejecuta con Next.js en el puerto `3001` durante desarrollo. El
repositorio define scripts para desarrollo, build, arranque en producción y
lint. En este momento no existe un `.env.example`, por lo que debes crear tu
archivo local a partir de una plantilla saneada, no copiando secretos reales.

## Flujo de desarrollo

Sigue estos pasos para trabajar en local.

1. Instala dependencias con `npm install`.
2. Crea un archivo `.env.local` con las variables necesarias.
3. Inicia el servidor con `npm run dev`.
4. Ejecuta `npm run lint` antes de abrir cambios.
5. Valida el build con `npm run build` cuando toques rutas, configuración o
   dependencias.

## Scripts disponibles

La siguiente tabla se genera a partir de `package.json`.

| Script | Comando | Descripción |
| --- | --- | --- |
| `dev` | `next dev -H 0.0.0.0 -p 3001` | Inicia el servidor de desarrollo en el puerto `3001` y lo expone en todas las interfaces |
| `build` | `next build` | Genera el build de producción de Next.js |
| `start` | `next start` | Arranca la aplicación ya compilada |
| `lint` | `eslint` | Ejecuta ESLint sobre el proyecto |

## Configuración de entorno

El proyecto no incluye `.env.example`. Hoy existen `.env.local` y `.env.prod`,
pero contienen valores reales y de plataforma. No reutilices esos valores como
plantilla compartida. Crea un archivo local nuevo y rellena únicamente los
nombres de variables necesarios.

### Variables de aplicación

Estas variables son las que configuran el comportamiento funcional del gestor.

| Variable | Propósito | Formato esperado |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API que consume el gestor | URL absoluta, por ejemplo `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación | URL absoluta, por ejemplo `https://escapemaster.es` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | URL absoluta de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase para el cliente | Token público de Supabase |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Clave para integraciones con Google Generative AI | API key secreta |
| `MISTRAL_API_KEY` | Clave para integraciones con Mistral | API key secreta |
| `VERCEL_OIDC_TOKEN` | Token OIDC inyectado por Vercel para flujos de plataforma | JWT o token de plataforma |

### Variables de build y plataforma

Estas variables aparecen en `.env.prod` y parecen ser inyectadas por la
plataforma de despliegue. No suelen definirse manualmente en desarrollo local.

| Variable | Propósito | Formato esperado |
| --- | --- | --- |
| `NX_DAEMON` | Controla el daemon de Nx | `true` o `false` |
| `TURBO_CACHE` | Configura el modo de caché de Turborepo | Cadena como `remote:rw` |
| `TURBO_DOWNLOAD_LOCAL_ENABLED` | Habilita descarga local de caché remota | `true` o `false` |
| `TURBO_REMOTE_ONLY` | Fuerza el uso exclusivo de caché remota | `true` o `false` |
| `TURBO_RUN_SUMMARY` | Activa el resumen de ejecución de Turborepo | `true` o `false` |
| `VERCEL` | Marca de entorno Vercel | `1` |
| `VERCEL_ENV` | Entorno lógico de Vercel | `development`, `preview` o `production` |
| `VERCEL_TARGET_ENV` | Entorno de despliegue objetivo | `development`, `preview` o `production` |
| `VERCEL_URL` | URL asignada por Vercel al despliegue | Host o URL |
| `VERCEL_GIT_COMMIT_AUTHOR_LOGIN` | Login del autor del commit | Cadena o vacío |
| `VERCEL_GIT_COMMIT_AUTHOR_NAME` | Nombre del autor del commit | Cadena o vacío |
| `VERCEL_GIT_COMMIT_MESSAGE` | Mensaje del commit desplegado | Cadena o vacío |
| `VERCEL_GIT_COMMIT_REF` | Rama o ref del despliegue | Cadena o vacío |
| `VERCEL_GIT_COMMIT_SHA` | SHA del commit desplegado | Hash o vacío |
| `VERCEL_GIT_PREVIOUS_SHA` | SHA anterior al despliegue actual | Hash o vacío |
| `VERCEL_GIT_PROVIDER` | Proveedor Git del despliegue | Cadena o vacío |
| `VERCEL_GIT_PULL_REQUEST_ID` | Identificador de PR asociado | Número o vacío |
| `VERCEL_GIT_REPO_ID` | Identificador interno del repositorio | Cadena o vacío |
| `VERCEL_GIT_REPO_OWNER` | Owner del repositorio | Cadena o vacío |
| `VERCEL_GIT_REPO_SLUG` | Nombre corto del repositorio | Cadena o vacío |

### Plantilla local recomendada

Usa esta plantilla mínima para empezar en local.

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"
GOOGLE_GENERATIVE_AI_API_KEY=""
MISTRAL_API_KEY=""
```

## Procedimiento de pruebas

`package.json` no define scripts de prueba en este momento. El repositorio sí
incluye `vitest` y `@playwright/test` como dependencias de desarrollo, así que
puedes ejecutar esas herramientas manualmente si el equipo lo necesita.

### Validación mínima actual

Antes de compartir cambios, ejecuta al menos estas comprobaciones:

1. Ejecuta `npm run lint`.
2. Ejecuta `npm run build` si tocaste rutas, imports o configuración.
3. Si necesitas una ejecución ad hoc de pruebas, usa `npx vitest` o
   `npx playwright test` y documenta el resultado en tu cambio.

## Notas importantes

La configuración actual presenta dos huecos documentales que conviene resolver:

- Falta un `.env.example` saneado para onboarding de desarrollo.
- Faltan scripts oficiales de `test`, `test:watch` y `test:e2e` aunque el
  proyecto ya tiene dependencias para esas herramientas.

## Siguientes pasos

Si quieres dejar esta carpeta completamente alineada con la fuente de verdad,
el siguiente paso natural es añadir un `.env.example` sin secretos y definir
scripts de prueba explícitos en `package.json`.
