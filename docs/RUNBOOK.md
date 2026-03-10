# Runbook operativo

Este runbook reúne los procedimientos mínimos para desplegar, vigilar y
recuperar `manager/gestor`. Se basa en el comportamiento visible en
`package.json` y en las variables de entorno presentes en el proyecto.

## Alcance

Este documento cubre operaciones de la aplicación Next.js del gestor. No cubre
despliegues de `manager/api`, migraciones de base de datos ni procesos
específicos del marketplace.

## Procedimiento de despliegue

El proyecto no define un script de deploy en `package.json`. El procedimiento
soportado por la aplicación es instalar dependencias, compilar y arrancar el
build resultante.

### Despliegue estándar

Sigue estos pasos para un despliegue controlado.

1. Verifica que las variables de entorno requeridas están presentes.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run lint`.
4. Genera el build con `npm run build`.
5. Arranca la app con `npm run start` si el entorno es self-hosted.

### Nota sobre plataforma

Los archivos de entorno existentes incluyen variables `VERCEL_*`, por lo que el
proyecto parece desplegarse en Vercel o en una plataforma compatible. Si usas
ese flujo, el paso clave es sincronizar las variables de entorno correctas antes
de lanzar el build.

## Variables críticas antes de desplegar

Estas variables afectan directamente a la salud de la aplicación.

| Variable | Impacto si falta o es incorrecta |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | El gestor no podrá cargar datos ni autenticar usuarios |
| `NEXT_PUBLIC_APP_URL` | Links absolutos y callbacks pueden fallar |
| `NEXT_PUBLIC_SUPABASE_URL` | Fallan integraciones cliente con Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Fallan llamadas públicas a Supabase |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Las funciones que dependan de Google AI dejarán de responder |
| `MISTRAL_API_KEY` | Las funciones que dependan de Mistral dejarán de responder |

## Monitoring y alertas

El repositorio no define una integración explícita con herramientas de
observabilidad. Mientras eso no exista, el equipo debe vigilar al menos estas
señales.

### Señales mínimas

Estas comprobaciones cubren la salud básica del gestor.

- La aplicación responde en la URL pública esperada.
- La carga inicial del dashboard no falla por `NEXT_PUBLIC_API_URL`.
- Las llamadas a Supabase no devuelven errores de configuración.
- `npm run build` sigue completando sin errores.
- `npm run lint` sigue pasando en CI o antes de desplegar.

### Alertas recomendadas

Aunque no estén automatizadas en el repo, estas alertas son las más útiles:

- Error rate alto en carga inicial de páginas protegidas.
- Incremento de respuestas `401` o `500` desde la API.
- Fallos de conexión con Supabase.
- Errores de proveedor AI por claves ausentes o inválidas.
- Build fallido en el pipeline de despliegue.

## Problemas comunes y solución

Esta tabla resume los fallos más probables según la configuración actual.

| Problema | Causa probable | Acción recomendada |
| --- | --- | --- |
| La app no arranca en local | Dependencias no instaladas o puerto ocupado | Ejecuta `npm install` y comprueba el puerto `3001` |
| El dashboard carga vacío o con errores de red | `NEXT_PUBLIC_API_URL` incorrecta | Revisa la URL y confirma que `manager/api` está disponible |
| Fallan llamadas a Supabase | `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` incorrectas | Revisa formato y valor de ambas variables |
| El build falla por imports o rutas | Código inválido o dependencias rotas | Ejecuta `npm run lint`, revisa imports y repite `npm run build` |
| Funciones AI no responden | Faltan `GOOGLE_GENERATIVE_AI_API_KEY` o `MISTRAL_API_KEY` | Configura las claves o desactiva la función afectada |
| El entorno de producción se comporta distinto a local | Variables `VERCEL_*` o URL públicas desalineadas | Compara el entorno desplegado con la configuración local |

## Procedimiento de rollback

El rollback debe volver tanto el código como la configuración a un estado
conocido y verificable.

### Rollback de aplicación

Sigue estos pasos si un despliegue rompe el gestor.

1. Detén el despliegue actual o despublícalo si la plataforma lo permite.
2. Recupera la última versión estable del código.
3. Restaura las variables de entorno de la versión estable.
4. Ejecuta `npm run build` sobre esa versión.
5. Arranca o vuelve a desplegar el build estable.
6. Verifica acceso a login, carga del dashboard y conexión a la API.

### Rollback de configuración

Si el problema es de entorno y no de código:

1. Restaura `NEXT_PUBLIC_API_URL` a la versión previamente válida.
2. Restaura `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Repite el despliegue sin cambiar el código.

## Documentación obsoleta para revisión manual

Se revisó el contenido de `manager/gestor/docs` y no hay archivos con más de
90 días sin modificación en este momento. La carpeta contiene documentación
actualizada recientemente.

## Gaps operativos detectados

Durante esta actualización aparecieron varios huecos que conviene tratar como
trabajo futuro:

- No existe `.env.example` saneado.
- No existen scripts de prueba en `package.json`.
- No hay un endpoint de health-check documentado para el frontend.
- No hay automatización documentada de monitorización o alertas.

## Siguientes pasos

Los siguientes pasos recomendados son añadir un `.env.example`, definir scripts
oficiales de prueba y documentar el flujo de despliegue exacto del entorno de
producción si va a seguir en Vercel.
