# Auditoría Completa del Codebase — Gestor (EscapeMaster)

**Fecha:** Julio 2025  
**Alcance:** Todos los archivos `.ts` / `.tsx` en `/gestor/src/`, `/gestor/e2e/`  
**Framework:** Next.js (App Router) · TypeScript · Tailwind CSS · Zustand · Axios  
**Producto:** EscapeMaster — SaaS de gestión de salas de escape

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Datos Hardcodeados](#2-datos-hardcodeados)
3. [TODOs y FIXMEs](#3-todos-y-fixmes)
4. [Errores y Anti-patrones](#4-errores-y-anti-patrones)
5. [Implementaciones Faltantes](#5-implementaciones-faltantes)
6. [Código Relacionado con Stripe](#6-código-relacionado-con-stripe)
7. [Problemas de Seguridad](#7-problemas-de-seguridad)
8. [Patrones Repetitivos / Código Duplicado](#8-patrones-repetitivos--código-duplicado)
9. [Inventario de Archivos](#9-inventario-de-archivos)
10. [Recomendaciones Priorizadas](#10-recomendaciones-priorizadas)

---

## 1. Resumen Ejecutivo

El proyecto **gestor** es una aplicación Next.js (App Router) que funciona como panel de gestión para negocios de escape rooms. Incluye autenticación JWT, sistema de reservas, calendario, control de horas, gestión de salas/roles/usuarios, reportes financieros, sistema de widgets para el dashboard, y una landing page animada con GSAP.

### Hallazgos Críticos

| Categoría | Severidad | Cantidad |
|-----------|-----------|----------|
| **Stripe / Pagos** | 🔴 Crítica | Sin integración real — completamente mockeado |
| **Seguridad** | 🔴 Crítica | 6 problemas (JWT manual, tokens en localStorage, etc.) |
| **Datos hardcodeados** | 🟠 Alta | 15+ instancias en producción |
| **Implementaciones faltantes** | 🟠 Alta | 12+ funcionalidades stub/incompletas |
| **Anti-patrones** | 🟡 Media | 10+ patrones problemáticos |
| **Código duplicado** | 🟡 Media | 5 patrones de duplicación |
| **TODOs pendientes** | 🟡 Media | 6 TODOs explícitos en el código |

---

## 2. Datos Hardcodeados

### 🔴 Críticos (afectan lógica de negocio)

| Archivo | Línea(s) | Valor Hardcodeado | Impacto |
|---------|----------|-------------------|---------|
| `src/app/payment/[token]/page.tsx` | ~30-50 | Booking completo mockeado: "La Prisión de Alcatraz", "Juan Pérez", "Calle Falsa 123, Madrid", €30.00 | Página de pago es completamente falsa |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | ~95 | `currentUserId = "gm1"` | ID de usuario actual es un string fijo |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | ~130-145 | Game Masters: "Carlos GM (Yo)", "Ana GM", "Pedro GM" | Opciones de GM hardcodeadas en lugar de cargar del API |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | ~111 | `gdpr_signed: true` | Consentimiento GDPR siempre verdadero |
| `src/app/(dashboard)/reports/page.tsx` | ~45-55 | `DEFAULT_EXPENSES`: Alquiler €2000, Nóminas €4500, Marketing €1200, Mantenimiento €800, Otros €500 | Gastos ficticios como datos reales |
| `src/app/(dashboard)/reports/page.tsx` | ~180 | `Math.round((revenueByDay[d]?.ingresos \|\| 0) * 0.3)` | Gastos estimados como 30% fijo de ingresos |
| `src/app/(dashboard)/reports/page.tsx` | — | Tasa de cancelación siempre 0% | Métrica falsa |
| `src/app/(dashboard)/hr-management/page.tsx` | ~120 | `(user.total_hours * 12).toFixed(2)€` | €12/hora fijo para todos los empleados |
| `src/components/views/TimeTrackingView.tsx` | ~140 | `12 días` | Vacaciones restantes hardcodeadas |
| `src/app/(dashboard)/rooms/[id]/page.tsx` | ~60 | `["¿Cómo nos conociste?", "Alergias o Intolerancias"]` | Campos personalizados por defecto |

### 🟠 Altos (URLs/dominios hardcodeados)

| Archivo | Valor | Impacto |
|---------|-------|---------|
| `src/lib/api/client.ts` | `baseURL: "https://manager.escapemaster.es/api"` | URL de producción hardcodeada (debería usar variable de entorno) |
| `src/app/robots.ts` | `escapemaster.io` | Dominio SEO fijo |
| `src/app/sitemap.ts` | `escapemaster.io` | Dominio SEO fijo |
| `src/app/docs/page.tsx` | `https://manager.escapemaster.es/api/docs` | URL API docs fija |
| `src/app/(dashboard)/users/create/page.tsx` | `manager.escapemaster.es/login` | URL de login fija en el modal de invitación |
| `src/app/(dashboard)/settings/page.tsx` | Datos de organización: "Mi Escape Room", teléfono, email, dirección | Valores por defecto en formulario de settings |
| `src/app/(dashboard)/settings/page.tsx` | `24,79€/mes` | Precio del plan hardcodeado |

### 🟡 Medio (landing page — marketing)

| Archivo | Valor |
|---------|-------|
| `src/components/ComingSoonLanding.tsx` | **Pricing**: Plan Gratis (0€) y Pro (24,79€/mes) |
| `src/components/ComingSoonLanding.tsx` | **Testimonios**: 3 testimonios inventados (Carlos R., Lucía M., Marc S.) con avatares de DiceBear |
| `src/components/ComingSoonLanding.tsx` | **Rating**: `aggregateRating: 4.9, ratingCount: 120` en structured data (JSON-LD) |
| `src/components/ComingSoonLanding.tsx` | Delta ingresos: `$1,240.00`, "Laboratorio Zombie" en badges floating |
| `src/components/domain/dashboard/widgets/revenue-widget.tsx` | `change: "+12.5%"` — cambio porcentual hardcodeado |
| `src/components/domain/dashboard/widgets/stats-cards.tsx` | `change: "Últimos 30 días"` — texto de tendencia hardcodeado |

---

## 3. TODOs y FIXMEs

| Archivo | Línea | TODO / Comentario |
|---------|-------|-------------------|
| `src/app/(dashboard)/bookings/[id]/page.tsx` | 105 | `// TODO: Add proper multi-player support when API supports it` |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | 111 | `// TODO: Get from API` (gdpr_signed) |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | 116 | `// TODO: Add comments endpoint to API` |
| `src/app/(dashboard)/reports/page.tsx` | 100 | `// TODO: Connect to expenses API` |
| `src/store/useDashboardStore.ts` | 76 | `// TODO: Improve to period-based cache if needed.` |
| `src/components/domain/dashboard/widgets/revenue-widget.tsx` | 31 | `// TODO: Calulate real change` (typo incluido) |
| `src/components/domain/dashboard/widgets/stats-cards.tsx` | 59 | `// TODO: Real trends` |
| `src/components/CalendarView.tsx` | 38 | `// TODO: Handle pagination if > 100 bookings in view` |

---

## 4. Errores y Anti-patrones

### 🔴 Anti-patrones Críticos

#### 4.1 — Clientes Axios duplicados
- **`src/services/api.ts`**: `baseURL: "/api"` (relativo, usa proxy de Next.js)
- **`src/lib/api/client.ts`**: `baseURL: "https://manager.escapemaster.es/api"` (producción hardcodeada)
- Ambos implementan el mismo patrón de interceptores para JWT
- **Riesgo**: Código muerto, confusión sobre cuál usar, URL de producción expuesta

#### 4.2 — Hooks stub completamente no funcionales
- **`src/lib/hooks/use-auth.ts`**: Retorna `{ user: null, isAuthenticated: false, login: () => {}, logout: () => {} }`
- **`src/lib/hooks/use-bookings.ts`**: Retorna `{ bookings: [], isLoading: false, isError: false }`
- Estos hooks existen como código muerto. La app usa `AuthContext` y llamadas directas al API service

#### 4.3 — `endpoints.ts` abandonado
- **`src/lib/api/endpoints.ts`**: Solo define 3 endpoints (`LOGIN`, `REGISTER`, `ME`) cuando `services/api.ts` tiene 50+ URLs inline

#### 4.4 — Uso de `alert()` y `prompt()` para UI
| Archivo | Uso |
|---------|-----|
| `src/app/(auth)/login/page.tsx` | `alert("¡Registro completado!")` |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | `alert()` para enviar link de pago |
| `src/app/(dashboard)/reports/page.tsx` | `alert()` fallback para export Excel |
| `src/app/(dashboard)/users/page.tsx` | `alert("Error al desactivar usuario")` |
| `src/app/(dashboard)/users/create/page.tsx` | `alert("Código copiado!")` |
| `src/app/(dashboard)/hr-management/page.tsx` | `prompt()` para notas de admin en vacaciones |
| `src/components/views/TimeTrackingView.tsx` | `alert("Error al iniciar turno")` |
| `src/components/views/DashboardView.tsx` | `prompt()` para nombre de colección |

#### 4.5 — Uso de `require()` dentro de `useEffect`
```typescript
// src/components/layout/sidebar/app-sidebar.tsx, línea ~35
useEffect(() => {
  if (isAuthenticated) {
    const { auth } = require("@/services/api"); // ⚠️ Dynamic require en componente cliente
    auth.getMemberships()...
  }
}, [isAuthenticated]);
```
- `require()` en componente "use client" rompe tree-shaking y es un anti-patrón en ESM/Next.js

#### 4.6 — Fetch de todos los elementos para buscar uno por ID
```typescript
// src/app/(dashboard)/rooms/[id]/page.tsx
const fetchRoom = async () => {
  const data = await roomsApi.list(); // Descarga TODAS las salas
  const room = allRooms.find((r) => r.id === params.id); // Para buscar una sola
};
```
- `rooms.get(id)` existe en el API service pero no se usa

#### 4.7 — Type assertions `any`
- **`src/services/api.ts`**: Usa `any` extensivamente en retornos y parámetros
- **`src/stores/data-store.ts`**: Todas las interfaces usan `any[]`
- **`src/app/(dashboard)/rooms/[id]/page.tsx`**: `(rooms as any).update(roomId, data)` — indica incertidumbre sobre el tipo de API

### 🟠 Anti-patrones Medios

#### 4.8 — `console.log` en código de producción
- **`src/middleware.ts`**: Múltiples `console.log` en middleware de autenticación, exponiendo información de estado del token
- **`src/components/layout/ViewRenderer.tsx`**: `console.log(\`VIEW_RENDERER: pathname=${pathname}\`)`
- **`src/components/domain/dashboard/useWidgetRegistry.ts`**: `console.log("DEBUG: API Widget Definitions received:", ...)`
- **`src/services/api.ts`**: ~15 `console.error` en todo el servicio
- **`src/components/views/CalendarView.tsx`**: `console.log(\`[Calendar] Fetching month...\`)`

#### 4.9 — Delays artificiales con `setTimeout`
```typescript
// src/app/onboarding/page.tsx
await new Promise((resolve) => setTimeout(resolve, 500)); // "DB consistency"
```
```typescript
// src/app/payment/[token]/page.tsx  
setTimeout(() => { setPaymentCompleted(true); }, 2000); // Simular pago
```

#### 4.10 — Estado de formularios sin validación
- **`src/app/(dashboard)/settings/page.tsx`**: Formulario de organización con `defaultValue` hardcodeados, sin `onSubmit`, sin validación. El botón "Guardar Cambios" no tiene handler conectado.
- **`src/app/(dashboard)/rooms/create/page.tsx`**: Validación mínima (solo `required` en HTML)
- La mayoría de formularios usan `FormData` nativo sin biblioteca de validación (Zod, Yup, react-hook-form, etc.)

---

## 5. Implementaciones Faltantes

### 🔴 Funcionalidades Completamente Stub

| Funcionalidad | Archivo | Estado |
|--------------|---------|--------|
| **Procesamiento de pagos** | `src/app/payment/[token]/page.tsx` | 100% mock — `setTimeout` simula pago |
| **Hook de autenticación** | `src/lib/hooks/use-auth.ts` | Retorna null/false siempre |
| **Hook de reservas** | `src/lib/hooks/use-bookings.ts` | Retorna arrays vacíos siempre |
| **Página de revenue** | `src/app/(dashboard)/reports/revenue/page.tsx` | Solo `<div>Revenue Reports Page</div>` |
| **Carga de foto perfil** | `src/app/(dashboard)/profile/page.tsx` | Botón "Cambiar Foto" sin `onClick` |
| **Cambiar contraseña** | `src/app/(dashboard)/profile/page.tsx` | Botón "Cambiar Contraseña" sin `onClick` |
| **Export CSV en RRHH** | `src/app/(dashboard)/hr-management/page.tsx` | Botón existe, sin implementación |
| **Eliminar sala** | `src/app/(dashboard)/rooms/[id]/page.tsx` | Botón de eliminar sin handler |
| **Guardar config organización** | `src/app/(dashboard)/settings/page.tsx` | Botón "Guardar Cambios" no conectado a ningún handler |
| **Integraciones (WhatsApp, Google Calendar, etc.)** | `src/app/(dashboard)/settings/page.tsx` | Botones "Conectar" sin implementación |
| **Forzar 2FA** | `src/app/(dashboard)/settings/page.tsx` | Marcado como "Próximamente / Enterprise" con `cursor-not-allowed` |
| **Guardar address/city/zip del onboarding** | `src/app/onboarding/page.tsx` | El paso Config recopila datos pero nunca los envía al API |

### 🟠 Funcionalidades Parciales

| Funcionalidad | Archivo | Problema |
|--------------|---------|----------|
| **Exportar Excel** | `src/app/(dashboard)/reports/page.tsx` | Falls back a CSV con `alert()` diciendo que requiere dependencia |
| **Enviar link de pago** | `src/app/(dashboard)/bookings/[id]/page.tsx` | Construye URL pero llama `alert()` en vez de enviar |
| **Comentarios en reservas** | `src/app/(dashboard)/bookings/[id]/page.tsx` | Estado local solo — nunca persiste al API |
| **Persistencia API de settings** | `src/app/(dashboard)/settings/page.tsx` | Los formularios de temas persisten, pero datos de organización/ubicación no |
| **Filtro de fechas en reportes** | `src/app/(dashboard)/reports/page.tsx` | El selector existe pero no conecta correctamente a las llamadas API |
| **Waitlist landing page** | `src/components/ComingSoonLanding.tsx` | El formulario de email no envía datos a ningún backend |

---

## 6. Código Relacionado con Stripe

### Resultado: **NO EXISTE integración real con Stripe**

La única mención de "Stripe" en todo el codebase es:

| Archivo | Contexto |
|---------|----------|
| `src/components/domain/bookings/BookingForm.tsx` L364 | Opción en dropdown de método de pago: `{ value: "Stripe", label: "Stripe" }` — solo un string en un `<select>` |
| `src/app/(dashboard)/settings/page.tsx` L506 | Card de integración: `{ name: "Stripe", desc: "Pagos y suscripciones", active: true }` — puramente visual, el botón "Configurar" no hace nada |

**No hay:**
- Importación de `@stripe/stripe-js` ni `stripe` SDK
- Checkout sessions
- Payment intents
- Webhooks
- Claves públicas/secretas
- Ningún código funcional de procesamiento de pagos

La página `payment/[token]/page.tsx` simula un pago con datos hardcodeados y `setTimeout`. Afirma "pago cifrado SSL" sin ninguna implementación real.

---

## 7. Problemas de Seguridad

### 🔴 Críticos

#### 7.1 — Parsing JWT manual sin validación de firma
```typescript
// src/middleware.ts
const payload = JSON.parse(atob(token.split(".")[1]));
```
```typescript
// src/context/AuthContext.tsx  
const decoded = JSON.parse(atob(token.split(".")[1]));
```
- `atob()` solo decodifica Base64, **no verifica la firma del JWT**
- Cualquier token con formato válido pasará la validación
- Debería usar una librería como `jose` o `jsonwebtoken`

#### 7.2 — Token JWT en localStorage
```typescript
// src/context/AuthContext.tsx
localStorage.setItem("token", data.token);
```
- `localStorage` es vulnerable a ataques XSS
- El token también se guarda en cookies (con `js-cookie`, sin `HttpOnly`)
- Doble almacenamiento crea riesgo de desincronización

#### 7.3 — Cookies JWT sin flags de seguridad
```typescript
// src/context/AuthContext.tsx
Cookies.set("token", data.token, { expires: 7 });
```
- Falta `secure: true` (solo HTTPS)
- Falta `sameSite: "strict"` (protección CSRF)
- `HttpOnly` no es posible desde JavaScript (la cookie debería ser set desde el servidor)
- Expiración fija de 7 días sin refresh token

#### 7.4 — `console.log` en middleware expone estado de auth
```typescript
// src/middleware.ts
console.log("Middleware: Token encontrado, verificando...");
console.log("Middleware: Token válido, exp:", new Date(payload.exp * 1000));
```
- En producción, expone información de autenticación en logs del servidor

### 🟠 Altos

#### 7.5 — Sin protección CSRF
- Los formularios no incluyen tokens CSRF
- Las cookies JWT no tienen `sameSite` 
- Posible exposición a ataques Cross-Site Request Forgery

#### 7.6 — Ausencia de rate limiting en el frontend
- Login, registro, reset de password no implementan throttling
- El formulario de waitlist no tiene protección contra spam

#### 7.7 — `updateUser` solo modifica estado local
```typescript
// src/context/AuthContext.tsx
const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));
```
- Si un componente cambia datos del usuario (como `preferences`), el cambio no persiste al API
- Solo el sidebar intenta persistir vía `updateUser` pero no le pasa a una llamada API real

#### 7.8 — JSON-LD con datos falsos
```typescript
// src/components/ComingSoonLanding.tsx
"aggregateRating": { "ratingValue": "4.9", "ratingCount": "120" }
```
- Datos de rating inventados en structured data pueden ser penalizados por Google

---

## 8. Patrones Repetitivos / Código Duplicado

### 8.1 — Duplicación del cliente HTTP
- **`src/services/api.ts`** y **`src/lib/api/client.ts`** implementan exactamente el mismo patrón:
  - Crear instancia de Axios
  - Interceptor de request para añadir `Authorization: Bearer` desde `localStorage`
  - Interceptor de response para manejar 401 (redirect a `/login`)
- **Acción**: Eliminar `src/lib/api/client.ts` (y `endpoints.ts`) — son código muerto

### 8.2 — Parsing JWT duplicado (3 ubicaciones)
```typescript
// Patrón repetido en:
// 1. src/middleware.ts
// 2. src/context/AuthContext.tsx (isTokenExpired)
// 3. src/context/AuthContext.tsx (login)
JSON.parse(atob(token.split(".")[1]))
```
- **Acción**: Crear una utilidad `parseJwt(token: string)` y reutilizar

### 8.3 — Normalización de respuestas API repetida
```typescript
// Patrón repetido en 5+ archivos:
const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
```
Aparece en: `useDashboardStore`, `data-store`, `CalendarView`, `BookingsView`, `services/api.ts`  
- **Acción**: Crear un helper `normalizeListResponse(data, key)` en utilidades

### 8.4 — Patrón de cache básico duplicado
```typescript
// Repetido en: useDashboardStore, data-store, CalendarView, BookingsView, TimeTrackingView
const isFresh = lastFetched && (Date.now() - lastFetched < 60000);
if (isFresh && data.length > 0) return;
```
- 5 implementaciones ligeramente distintas del mismo concepto de cache temporal
- **Acción**: Crear un hook `useCachedFetch(fetcher, cacheKey, ttl)` o usar React Query/SWR

### 8.5 — Reset de contraseña duplicado
- **`src/app/(auth)/forgot-password/page.tsx`**: Flujo completo de enviar código + resetear contraseña inline
- **`src/app/(auth)/reset-password/page.tsx`**: Página independiente para resetear contraseña
- Ambas hacen esencialmente lo mismo
- **Acción**: Unificar en un solo flujo

### 8.6 — Archivos `utils` duplicados
- **`src/lib/utils.ts`** y **`src/utils/index.ts`**: Ambos exportan exactamente la misma función `cn()`
- **Acción**: Eliminar uno y actualizar imports

---

## 9. Inventario de Archivos

### Infraestructura y Config
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/middleware.ts` | Protección de rutas JWT | ⚠️ JWT manual, console.logs |
| `src/services/api.ts` | Capa API (50+ endpoints) | ⚠️ Tipos `any` extensivos |
| `src/lib/api/client.ts` | Cliente axios duplicado | 🔴 Código muerto |
| `src/lib/api/endpoints.ts` | 3 endpoints | 🔴 Código muerto |
| `src/lib/utils.ts` | `cn()` utility | 🔴 Duplicado |
| `src/utils/index.ts` | `cn()` utility | ✅ Usado |
| `src/lib/hooks/use-auth.ts` | Auth hook | 🔴 Stub — no funcional |
| `src/lib/hooks/use-bookings.ts` | Bookings hook | 🔴 Stub — no funcional |

### Contextos
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/context/AuthContext.tsx` | Auth + JWT + user state | ⚠️ Seguridad JWT, dual storage |
| `src/context/ThemeContext.tsx` | Multi-theme + dark mode | ✅ Funcional |

### Stores (Zustand)
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/store/useDashboardStore.ts` | Cache de dashboard | ⚠️ Cache stats incompleto, TODO |
| `src/stores/auth-store.ts` | Auth persistido (Zustand + persist) | ⚠️ Duplica AuthContext |
| `src/stores/dashboard-layout-store.ts` | Layout de widgets | ✅ Funcional |
| `src/stores/data-store.ts` | Datos globales (rooms, roles, users) | ⚠️ Tipos `any[]` |
| `src/stores/ui-store.ts` | Estado UI (sidebar, vista) | ✅ Funcional |

### Páginas — Auth
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/app/(auth)/login/page.tsx` | Login dual (estándar + código) | ⚠️ `alert()` |
| `src/app/(auth)/register/page.tsx` | Registro + verificación | ✅ |
| `src/app/(auth)/forgot-password/page.tsx` | Flujo reset inline | ⚠️ Duplica reset-password |
| `src/app/(auth)/reset-password/page.tsx` | Reset standalone | ⚠️ Duplica forgot-password |

### Páginas — Dashboard
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/app/(dashboard)/layout.tsx` | Layout con Sidebar + ViewRenderer | ✅ |
| `src/app/(dashboard)/dashboard/page.tsx` | Retorna `null` (usa ViewRenderer) | ✅ |
| `src/app/(dashboard)/bookings/page.tsx` | Retorna `null` (usa ViewRenderer) | ✅ |
| `src/app/(dashboard)/bookings/create/page.tsx` | Crear reserva | ✅ |
| `src/app/(dashboard)/bookings/[id]/page.tsx` | Detalle reserva | 🔴 Datos hardcoded, TODOs |
| `src/app/(dashboard)/calendar/page.tsx` | Retorna `null` (usa ViewRenderer) | ✅ |
| `src/app/(dashboard)/docs/page.tsx` | Link a API docs | ⚠️ URL hardcodeada |
| `src/app/(dashboard)/hr-management/page.tsx` | Gestión RRHH | ⚠️ €12/h hardcoded, `prompt()` |
| `src/app/(dashboard)/profile/page.tsx` | Perfil de usuario | 🔴 Botones sin handler |
| `src/app/(dashboard)/reports/page.tsx` | Reportes | 🔴 Gastos hardcoded, métricas falsas |
| `src/app/(dashboard)/reports/revenue/page.tsx` | Revenue report | 🔴 Stub total |
| `src/app/(dashboard)/roles/page.tsx` | Lista de roles | ✅ |
| `src/app/(dashboard)/roles/create/page.tsx` | Crear rol | ✅ |
| `src/app/(dashboard)/roles/[id]/page.tsx` | Editar rol | ✅ |
| `src/app/(dashboard)/rooms/page.tsx` | Lista de salas | ✅ |
| `src/app/(dashboard)/rooms/create/page.tsx` | Crear sala | ✅ |
| `src/app/(dashboard)/rooms/[id]/page.tsx` | Editar sala | ⚠️ Fetch innecesario, fields hardcoded |
| `src/app/(dashboard)/settings/page.tsx` | Configuración | 🔴 Formulario no funcional, datos mock |
| `src/app/(dashboard)/settings/emails/page.tsx` | Templates email | ✅ |
| `src/app/(dashboard)/settings/widgets/page.tsx` | Config widgets | ⚠️ UI en inglés (inconsistencia) |
| `src/app/(dashboard)/time-tracking/page.tsx` | Retorna `null` (usa ViewRenderer) | ✅ |
| `src/app/(dashboard)/users/page.tsx` | Lista usuarios | ✅ |
| `src/app/(dashboard)/users/create/page.tsx` | Crear usuario + código invitación | ✅ |
| `src/app/(dashboard)/users/[id]/edit/page.tsx` | Editar usuario | ✅ |

### Páginas — Públicas
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/app/page.tsx` | Landing (ComingSoonLanding) | ✅ |
| `src/app/layout.tsx` | Root layout + SEO metadata | ✅ |
| `src/app/payment/[token]/page.tsx` | Página de pago | 🔴 Completamente mock |
| `src/app/onboarding/page.tsx` | Onboarding 4 pasos | ⚠️ Paso config no guarda |
| `src/app/robots.ts` | Robots.txt | ⚠️ Dominio hardcodeado |
| `src/app/sitemap.ts` | Sitemap | ⚠️ Dominio hardcodeado |
| `src/app/privacy/page.tsx` | Política privacidad | ✅ |
| `src/app/cookies/page.tsx` | Política cookies | ✅ |

### Vistas (Persistentes via ViewRenderer)
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/components/views/DashboardView.tsx` | Dashboard + widgets drag&drop | ✅ Complejo pero funcional |
| `src/components/views/CalendarView.tsx` | Calendario mes/semana/día | ✅ |
| `src/components/views/BookingsView.tsx` | Lista de reservas con filtros | ✅ |
| `src/components/views/TimeTrackingView.tsx` | Control de horas + vacaciones | ⚠️ Vacaciones hardcoded |

### Layout
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/components/layout/ViewRenderer.tsx` | Shell de vistas persistentes | ⚠️ `console.log` |
| `src/components/layout/sidebar/app-sidebar.tsx` | Sidebar con nav + org switcher | ⚠️ `require()` dinámico |
| `src/components/layout/sidebar/nav-item.tsx` | Item de navegación | ✅ |

### Dashboard Widgets
| Archivo | Descripción |
|---------|-------------|
| `src/components/domain/dashboard/types.ts` | Tipos TypeScript para widgets |
| `src/components/domain/dashboard/widget-registry.tsx` | Registro de 12 widgets |
| `src/components/domain/dashboard/useWidgetRegistry.ts` | Sync con API para config de widgets |
| `src/components/domain/dashboard/WidgetConfigModal.tsx` | Modal de configuración |
| `src/components/domain/dashboard/SaveCollectionModal.tsx` | Modal guardar colección |
| `src/components/domain/dashboard/TemplatePreview.tsx` | Preview de plantillas |
| `src/components/domain/dashboard/widgets/stats-cards.tsx` | Widget estadísticas |
| `src/components/domain/dashboard/widgets/upcoming-sessions.tsx` | Widget próximas sesiones |
| `src/components/domain/dashboard/widgets/team-status.tsx` | Widget estado equipo |
| `src/components/domain/dashboard/widgets/revenue-widget.tsx` | Widget ingresos |
| `src/components/domain/dashboard/widgets/calendar-widget.tsx` | Widget calendario |
| `src/components/domain/dashboard/widgets/notes-widget.tsx` | Widget notas |
| `src/components/domain/dashboard/widgets/revenue-bar-chart.tsx` | Gráfico de ingresos |
| `src/components/domain/dashboard/widgets/occupancy-pie-chart.tsx` | Gráfico de ocupación |
| `src/components/domain/dashboard/widgets/quarterly-stats.tsx` | Estadísticas trimestrales |
| `src/components/domain/dashboard/widgets/revenue-table.tsx` | Tabla de transacciones |
| `src/components/domain/dashboard/widgets/FiscalWidget.tsx` | Widget fiscal |
| `src/components/domain/dashboard/widgets/ProjectedEarningsWidget.tsx` | Proyección de ganancias |
| `src/components/domain/dashboard/widgets/BlockHoursModal.tsx` | Modal bloqueo de horas |

### Componentes Base
| Archivo | Descripción |
|---------|-------------|
| `src/components/Button.tsx` | Botón con variantes |
| `src/components/Card.tsx` | Card + CardHeader/Footer |
| `src/components/Input.tsx` | Input con label/icon |
| `src/components/Select.tsx` | Select con label |
| `src/components/Modal.tsx` | Modal genérico |
| `src/components/Tabs.tsx` | Componente de tabs |
| `src/components/Calendar.tsx` | Componente calendario |
| `src/components/CalendarView.tsx` | Vista calendario alternativa |
| `src/components/RichTextEditor.tsx` | Editor de texto enriquecido |
| `src/components/Sidebar.tsx` | Sidebar legacy (posible duplicado) |
| `src/components/ComingSoonLanding.tsx` | Landing page (1084 líneas) |

---

## 10. Recomendaciones Priorizadas

### Prioridad 1 — Críticas (resolver antes de producción)

1. **Implementar Stripe**: Integrar `@stripe/stripe-js` y `stripe` SDK. Crear Checkout Sessions en el backend, manejar webhooks, reemplazar la página de pago mock.

2. **Corregir seguridad JWT**: Usar `jose` o similar para verificar firmas JWT. Mover tokens a cookies `HttpOnly` + `Secure` + `SameSite=Strict` desde el servidor. Eliminar `localStorage` para tokens.

3. **Eliminar código muerto**: Borrar `src/lib/api/client.ts`, `src/lib/api/endpoints.ts`, `src/lib/hooks/use-auth.ts`, `src/lib/hooks/use-bookings.ts`. Unificar `src/lib/utils.ts` con `src/utils/index.ts`.

4. **Eliminar datos hardcodeados de negocio**: `currentUserId`, Game Masters, gastos DEFAULT_EXPENSES, tarifa €12/h, vacaciones "12 días". Todos deben venir del API.

5. **Implementar funcionalidades stub**: Especialmente el cambio de contraseña, upload de foto, exportar CSV en RRHH, eliminar salas, y el formulario de configuración de la organización.

### Prioridad 2 — Altas (resolver para v1.0)

6. **Reemplazar `alert()`/`prompt()`** por un sistema de toast/notificaciones (por ejemplo, `sonner` o `react-hot-toast`).

7. **Añadir validación de formularios** con Zod + react-hook-form en todos los formularios de la aplicación.

8. **Unificar caché**: Adoptar React Query o SWR en lugar de 5 implementaciones manuales de cache.

9. **Centralizar URLs hardcoded**: Mover `escapemaster.io`, `manager.escapemaster.es` a variables de entorno (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`).

10. **Resolver duplicación**: Auth store de Zustand vs AuthContext de React — elegir uno.

### Prioridad 3 — Medias (mejora continua)

11. **Eliminar `console.log`/`console.error`** de producción o configurar un logger estructurado.

12. **Tipar el API service**: Reemplazar `any` por interfaces TypeScript apropiadas.

13. **Unificar idioma**: La página de widgets y algunos labels están en inglés; el resto en español. Decidir si se implementa i18n.

14. **Reducir tamaño de `ComingSoonLanding.tsx`** (1084 líneas): Extraer secciones en componentes independientes (`HeroSection`, `PricingSection`, `TestimonialsSection`).

15. **Remover JSON-LD falso** de la landing page (aggregateRating inventado de 4.9 con 120 reviews).

---

*Fin del reporte de auditoría.*
