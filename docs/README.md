# 🖥️ Escapemaster Web - Documentación Técnica

> La aplicación moderna y responsiva para el ecosistema Escapemaster.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## 📋 Visión General

Escapemaster Web es la interfaz principal para el staff y dueños de Escape Rooms. Proporciona un dashboard personalizable, gestión de reservas y configuración, todo envuelto en un sistema de temas dinámicos.

## 🏗️ Arquitectura y Stack

La aplicación está construida sobre **Next.js 16** utilizando la arquitectura **App Router**.

### Stack Principal

- **Framework:** Next.js 16 (React 19)
- **Lenguaje:** TypeScript 5.0
- **Styling:** Tailwind CSS v4 + CSS Variables para theming
- **State Management:** Zustand (Global Store) + React Context (Theme/Auth)
- **Data Fetching:** Axios
- **Drag & Drop:** `@dnd-kit` (Personalización de dashboard)
- **Gráficos:** `recharts`
- **Iconos:** `lucide-react`

### Estructura del Proyecto

```
manager-gestor/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Login/Register routes
│   │   ├── (dashboard)/  # Rutas protegidas de la aplicación
│   │   └── layout.tsx    # Layout raíz
│   ├── components/
│   │   ├── ui/           # Componentes atómicos reutilizables
│   │   ├── domain/       # Componentes específicos de negocio
│   │   └── layout/       # Sidebar, Header, Shell
│   ├── context/          # Proveedores React Context (Theme, Auth)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilidades (axios instance, cn helper)
│   ├── services/         # Capa de integración API
│   ├── store/            # Zustand stores
│   └── types/            # Definiciones TypeScript
├── e2e/                  # Tests end-to-end (Playwright)
└── public/               # Assets estáticos
```

## 🌟 Hitos Recientes (Febrero 2026)

- **Rebranding Completo:** Todos los componentes migrados a la marca **Escapemaster**
- **Gestión RRHH:** Secciones `/rrhh`, `/control-horario` y `/roles`
- **Optimización Móvil:** Todas las vistas optimizadas para dispositivos móviles
- **Sistema de Temas Global:** Contexto de temas con 8+ paletas predefinidas (Twilight, Tropical, Vista, etc.)
- **Dashboard Modular:** Sistema basado en widgets con capacidades de drag-and-drop

## 🚀 Fases de Desarrollo y Roadmap

### ✅ Fase 1: Fundamentos UI (Completada)

- [x] Next.js 16 + Tailwind v4 setup
- [x] Sistema de temas globales (8+ presets)
- [x] App Shell responsivo (Sidebar, Header)
- [x] Sistema de widgets de dashboard (UI)
- [x] Motor de layout con drag-and-drop

### 🚧 Fase 2: Integración (En Progreso)

- [ ] **Conexión API:** Reemplazar datos mock con llamadas API reales
- [ ] **Persistencia:** Guardar preferencias de usuario (tema, layout) en backend
- [ ] **Settings:** Implementar formularios para configuración de organización y ubicación
- [ ] **Bookings:** Construir calendar interactivo y vistas de lista de reservas
- [ ] **Users:** Gestión completa de empleados y roles

### 🔮 Fase 3: Funcionalidades Avanzadas (Planeado)

- [ ] **Real-time:** Implementar WebSockets para actualizaciones en vivo de reservas
- [ ] **Offline Mode:** Capacidades básicas de PWA para sin internet
- [ ] **Performance:** Prefetching de rutas y optimización de imágenes

## 🧪 Testing

El proyecto incluye herramientas de prueba en `devDependencies`, pero la fuente
de verdad actual (`package.json`) todavía no expone scripts de `test`.
Consulta `docs/CONTRIB.md` para el flujo real de validación mientras se
normalizan esos scripts.

### Estado actual

La configuración actual soporta estas validaciones:

- `npm run lint`
- `npm run build`
- Ejecuciones manuales con `npx vitest` o `npx playwright test` si el equipo
  necesita pruebas ad hoc

## 🛠️ Setup e Instalación

### 1. Clonar Repositorio

```bash
git clone https://github.com/diegogzt/manager-gestor.git
cd manager-gestor
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Entorno

Crear `.env.local` y agregar:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3001`

## 📚 Documentación Adicional

Para documentación completa del sistema, ver:
- [Docs Escapemaster](../../docs/README.md) - Documentación centralizada
- [Contexto para IA](../../docs/03-contexto-ia/) - Guía para desarrolladores
- [Backend API](../../manager/api/docs/) - Documentación de la API
- [Guías de Usuario](../../docs/02-guias-usuario/) - Documentación para usuarios finales
- [Contribución y desarrollo](./CONTRIB.md) - Scripts, entorno y flujo de trabajo actual
- [Runbook operativo](./RUNBOOK.md) - Despliegue, incidencias y rollback

## Integración con marketplace

El gestor depende de `manager/api` como backend canónico para la integración con
`marketplace`. Usa estos documentos cuando trabajes en onboarding, publicación
de salas, calendario o reservas originadas en el canal B2C.

- [ADR canónico](../../api/docs/adr-manager-api-canonico.md)
- [Onboarding bidireccional](../../api/docs/onboarding-bidireccional-marketplace.md)
- [API v1 de reservas marketplace](../../api/docs/api-reservas-marketplace-v1.md)
- [Publicación de salas](../../api/docs/publicacion-marketplace.md)
- [Pagos y liquidación](../../api/docs/pagos-liquidacion-marketplace.md)

## 🎨 Sistema de Temas

La aplicación incluye un sistema de theming dinámico con múltiples paletas:

### Paletas Disponibles

- **Escapemaster Original** - Paleta principal naranja vibrante
- **Twilight** - Tema oscuro profundo para turnos nocturnos
- **Tropical** - Colores vibrantes inspirados en la naturaleza
- **Vista** - Tonos naturales y terrosos
- **Neon** - Colores neón brillantes
- **Meadow** - Verde pradera vibrante
- **Nature** - Verde natural y fresco
- [y más...]

### API de Temas

```typescript
// Uso en cualquier componente
import { useTheme } from '@/context/ThemeContext';

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={() => setTheme('twilight')}>
        Cambiar a Twilight
      </button>
    </div>
  );
}
```

## 🔐 Autenticación y Autorización

### Flujo de Login

1. Usuario ingresa credenciales en `/login`
2. Credenciales enviadas a backend API: `POST /auth/login`
3. Tokens (access + refresh) almacenados en localStorage
4. Usuario redirigido a `/dashboard`

### Tokens JWT

```typescript
// Uso de Axios con tokens interceptados
import axios from '@/lib/axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirect a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📊 Gestión de Estado

### Zustand Stores

```typescript
// src/store/useBookingsStore.ts
import { create } from 'zustand';
import type { Booking } from '@/types/booking';

interface BookingsStore {
  bookings: Booking[];
  loading: boolean;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useBookingsStore = create<BookingsStore>((set) => ({
  bookings: [],
  loading: false,
  setBookings: (bookings) => set({ bookings, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

// Uso
import { useBookingsStore } from '@/store/useBookingsStore';

export function BookingList() {
  const { bookings, loading, setBookings } = useBookingsStore();

  useEffect(() => {
    // Cargar reservas...
  }, []);

  return (
    <div>
      {loading && <Spinner />}
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

## 📁 Estructura de Rutas

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── bookings/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── rooms/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── layout.tsx
├── layout.tsx
└── page.tsx
```

## 🔧 Scripts Disponibles

La referencia actual de scripts en `package.json` es la siguiente:

```bash
npm run dev     # Inicia Next.js en el puerto 3001
npm run build   # Genera el build de producción
npm run start   # Arranca la aplicación compilada
npm run lint    # Ejecuta ESLint
```

## 🚀 Despliegue

Despliegue mediante Dokploy usando `dokploy.yml` en la raíz del proyecto.
Configura las variables de entorno en el panel de Dokploy para cada entorno
(preproduction-v2 → API v2, production-v1 → API v1).

Variables requeridas:
- `NEXT_PUBLIC_API_URL` → URL de API (`https://my.escapemaster.es/api/v1` o `/v2`)
- `NEXT_PUBLIC_APP_URL` → URL pública (`https://my.escapemaster.es`)
- `GOOGLE_GENERATIVE_AI_API_KEY` → Clave de Google AI
- `MISTRAL_API_KEY` → Clave de Mistral

## 📊 Métricas del Proyecto

- **Páginas:** 20+
- **Componentes:** 100+
- **Líneas de código:** ~15,000
- **Tests:** ~50 (unitarios + E2E)
- **Cobertura:** ~70%

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add: amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre un Pull Request

## 🐛 Reportar Issues

Para reportar bugs o sugerir mejoras:
- GitHub Issues: https://github.com/diegogzt/manager-gestor/issues
- Contacto: soporte@escapemaster.es

---

**Última actualización:** 4 de febrero de 2026
