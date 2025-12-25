# Registro de Cambios y Hoja de Ruta (Frontend & API)

Este documento resume los cambios recientes realizados en `escapemaster-web` para mejorar la interfaz y la experiencia de usuario, así como los requisitos necesarios en la API (`escapemaster-api`) para soportar estas nuevas funcionalidades de manera persistente.

## 1. Cambios Recientes en Escapemaster Web

### Correcciones y Mejoras en Reportes (Diciembre 2025)

**Estabilidad y Navegación:**

- **AuthContext Fix**: Se solucionó un error crítico de "hoisting" que causaba crashes al iniciar sesión (`ReferenceError: logout is not defined`).
- **Sidebar**: Se corrigió el enlace de "Reportes" para apuntar a `/reports` en lugar de `/reports/revenue`.

**Módulo de Reportes (`/reports`):**

- **UI Compacta**: Se redujo el espaciado general (`gap-4`, `space-y-4`) para aumentar la densidad de información.
- **Filtros Avanzados**: Nuevas opciones de rango de fechas: "Últimos 3 meses", "Últimos 6 meses", "Este año" y "Personalizado" (con selectores de fecha inicio/fin).
- **Gestión de Gastos**: Nuevo modal para registrar gastos operativos directamente desde el dashboard.
- **Generador de Gráficas**: Nuevo modal para configurar y añadir visualizaciones personalizadas.
- **Visualización**:
  - KPIs con indicadores de color semánticos (bordes laterales).
  - Tooltips y leyendas mejoradas en todos los gráficos (Recharts).
  - Tablas de transacciones con estilos actualizados.

### Sistema de Temas Global (Theming)

Se ha implementado un sistema de temas dinámico que permite cambiar la paleta de colores de toda la aplicación en tiempo real.

- **Contexto**: `src/context/ThemeContext.tsx` gestiona el estado del tema y lo persiste en `localStorage` (`escapemaster-theme`).
- **CSS Variables**: Se utilizan variables CSS (`--color-primary`, `--color-secondary`, etc.) inyectadas en el `body` según el tema seleccionado.
- **Tailwind**: Configurado para usar estas variables (`bg-primary`, `text-primary`), permitiendo que los componentes reaccionen automáticamente al cambio de tema.
- **Temas Disponibles**: Twilight (Default), Tropical, Vista, Mint Fresh, Sunset, Ocean, Lavender, Fire.

### Rediseño del Dashboard

El dashboard ha sido refactorizado para ser más modular y visualmente consistente.

- **Widgets**: Se han creado y estilizado múltiples widgets en `src/components/domain/dashboard/widgets/`:
  - `StatsCards`: Tarjetas de métricas clave (Ingresos, Reservas, etc.).
  - `UpcomingSessions`: Lista de próximas sesiones con estados.
  - `QuarterlyStats`: Resumen trimestral con comparativas.
  - `RevenueBarChart`: Gráfico de barras de ingresos vs gastos (Recharts).
  - `OccupancyPieChart`: Gráfico circular de ocupación por sala.
  - `TeamStatus`: Estado del personal (online, busy, offline).
  - `RevenueTable`: Tabla de transacciones recientes.
  - `CalendarWidget`: Calendario interactivo simple.
  - `NotesWidget`: Widget de notas rápidas (actualmente local).
- **Layout**: Grid flexible con soporte para arrastrar y soltar (DnD Kit) y redimensionamiento (aunque la persistencia es local por ahora).
- **Modal "Añadir Widget"**: Nueva interfaz para agregar widgets al tablero, con indicadores visuales de qué widgets ya están activos.

### Página de Configuración (`/settings`)

- **Layout Full Width**: Se eliminó la restricción de ancho máximo (`max-w-6xl`) para aprovechar todo el espacio de la pantalla.
- **Selector de Tema**: Interfaz visual para previsualizar y seleccionar el tema de la aplicación.
- **Secciones**: Organización, Ubicación e Integraciones (UI lista para conectar).

### Consistencia Visual

- Se han eliminado colores "hardcoded" (ej. `bg-green-600`) en favor de colores semánticos del tema (`bg-primary`).
- Actualización de componentes base (`Card`, `Input`, `Button`) para adherirse al sistema de diseño.

---

## 2. Requisitos de API (Backend Changes)

Para que las funcionalidades del frontend sean persistentes y dinámicas, se requieren los siguientes cambios en `escapemaster-api`.

### 2.1. Preferencias de Usuario / Organización

Necesitamos persistir la configuración del tema y los datos de la organización.

- **`GET /api/v1/settings/preferences`**
  - **Respuesta**: `{ theme: "twilight", language: "es", ... }`
- **`PUT /api/v1/settings/preferences`**

  - **Body**: `{ theme: "tropical" }`
  - **Acción**: Guardar la preferencia de tema del usuario en la base de datos.

- **`GET /api/v1/organization/profile`**
  - **Respuesta**: Datos actuales de la organización (nombre, web, dirección, etc.) para poblar la página de Settings.
- **`PUT /api/v1/organization/profile`**
  - **Body**: `{ name, website, address, ... }`
  - **Acción**: Actualizar perfil de la organización.

### 2.2. Endpoints del Dashboard

Actualmente, los widgets usan datos simulados (`mock data`). Se necesitan endpoints reales para alimentar cada widget.

| Widget               | Endpoint Sugerido                   | Método | Descripción                                                                            |
| -------------------- | ----------------------------------- | ------ | -------------------------------------------------------------------------------------- | --------- |
| **StatsCards**       | `/api/v1/dashboard/stats/summary`   | GET    | Retorna ingresos totales, reservas, clientes activos, salas activas y sus % de cambio. |
| **UpcomingSessions** | `/api/v1/bookings/upcoming`         | GET    | Lista de sesiones para el día actual (limitada a 5-10).                                |
| **QuarterlyStats**   | `/api/v1/dashboard/stats/quarterly` | GET    | Métricas agregadas del trimestre actual vs anterior.                                   |
| **RevenueChart**     | `/api/v1/dashboard/revenue/chart`   | GET    | Datos para gráfico (ingresos/gastos por mes). Params: `period=year                     | 6months`. |
| **OccupancyChart**   | `/api/v1/dashboard/occupancy`       | GET    | % de ocupación por sala.                                                               |
| **TeamStatus**       | `/api/v1/users/status`              | GET    | Lista de empleados y su estado actual (online/offline/busy).                           |
| **RevenueTable**     | `/api/v1/transactions/recent`       | GET    | Últimas transacciones financieras.                                                     |
| **Calendar**         | `/api/v1/bookings/calendar`         | GET    | Disponibilidad/Ocupación por día para el mes.                                          |

### 2.3. Persistencia del Layout del Dashboard

Para que el usuario no pierda su organización de widgets al recargar.

- **`GET /api/v1/dashboard/layout`**
  - **Respuesta**: Array de configuración de widgets (`[{ id: "stats-1", type: "stats", colSpan: 48, rowSpan: 6, ... }]`).
- **`PUT /api/v1/dashboard/layout`**
  - **Body**: `{ layout: WidgetConfig[] }`
  - **Acción**: Guardar la posición y tamaño de los widgets del usuario.

---

## 3. Futuras Integraciones Frontend

Pasos a seguir en `escapemaster-web` para completar la migración a una aplicación totalmente funcional.

1.  **Capa de Servicios (API Client)**:

    - Actualizar `src/services/api.ts` para incluir los nuevos endpoints definidos arriba.
    - Implementar interceptores para manejo de errores global y tokens de autenticación.

2.  **Integración de Datos (React Query / SWR)**:

    - Reemplazar los arrays estáticos en los widgets con hooks de data fetching (ej. `useQuery(['dashboardStats'], fetchStats)`).
    - Añadir estados de carga (`Skeleton` loaders) en los widgets mientras cargan los datos reales.

3.  **Formularios de Configuración**:

    - Conectar los inputs de la página `/settings` a `react-hook-form`.
    - Implementar la lógica de "Guardar Cambios" que llame a `PUT /api/v1/organization/profile`.

4.  **Widget de Notas**:

    - Decidir si las notas son privadas (localStorage) o compartidas (Backend). Si son compartidas, implementar CRUD de notas.

5.  **Autenticación Real**:

    - Asegurar que el token JWT se envíe en todas las peticiones al backend.
    - Manejar la expiración de sesión y redirección al login.

6.  **Testing E2E**:
    - Actualizar tests de Playwright para verificar que el cambio de tema funciona y que los widgets renderizan datos (aunque sean mockeados por ahora).
