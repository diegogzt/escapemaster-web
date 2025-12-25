# **📘 Plan Maestro de Ingeniería Frontend: Escapemaster Web**

Versión: 3.0 (Arquitectura Detallada y Ubicación de Componentes)  
Proyecto: Gestor de Reservas (Escape Rooms)  
Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query.  
Objetivo: UX de "Latencia Cero", Mobile-First, Diseño "Vista".  
Este documento sirve como la **única fuente de verdad** para la estructura de archivos, la ubicación de componentes y la lógica de interfaz.

## **1\. 🏗️ Arquitectura de Carpetas y Patrón de Diseño**

Para mantener el proyecto escalable, separaremos los componentes "tontos" (UI pura) de los componentes de "negocio" (Domain).

### **1.1. Estrategia de Organización**

* **app/**: Solo para rutas, layouts y page.tsx. Mínima lógica, solo composición.  
* **components/ui/**: Primitivas de diseño (Botones, Inputs, Cards). Generados por shadcn/ui. **No tocan la API**.  
* **components/domain/\[modulo\]/**: Componentes específicos del negocio (ej: BookingCard, RevenueChart). Aquí vive la lógica, los hooks de datos y el estado.  
* **lib/**: Utilidades puras, configuración de clientes (Axios/Fetch, Supabase), validadores Zod.  
* **hooks/**: Custom hooks globales (ej: useAuth, usePermissions).

## **2\. 🎨 Sistema de Diseño: Implementación "Vista"**

Mantener configuración de Tailwind (tailwind.config.ts) definida en la versión anterior.

### **2.1. Layout Global (App Shell)**

* **Ubicación:** app/(dashboard)/layout.tsx  
* **Composición Visual:**  
  * **Sidebar (Escritorio):** Columna fija izquierda (256px).  
    * *Componente:* components/layout/sidebar/main-sidebar.tsx  
  * **Mobile Header (Móvil/Tablet):** Barra superior sticky (64px).  
    * *Componente:* components/layout/header/mobile-nav.tsx  
  * **Main Content:** Área restante (flex-1). Contenedor con p-4 md:p-6 bg-vista-cream-pale.  
    * *Renderiza:* {children} (Las páginas).

## **3\. 🧩 Especificaciones Detalladas por Módulo y Ubicación**

### **3.1. Módulo: Dashboard (Inicio)**

**Ruta:** app/(dashboard)/page.tsx

**Distribución Visual:** Grid responsive (grid-cols-1 md:grid-cols-2 xl:grid-cols-4).

**Componentes y Ubicación:**

1. **Widget de Ingresos (RevenueWidget)**  
   * *Ubicación:* components/domain/dashboard/widgets/revenue-widget.tsx  
   * *Posición UI:* Fila 1, Columna 1 (Ocupa 1 espacio).  
   * *Detalle:* Usa Recharts para el gráfico sparkline.  
2. **Widget Próximas Sesiones (UpcomingSessions)**  
   * *Ubicación:* components/domain/dashboard/widgets/upcoming-sessions.tsx  
   * *Posición UI:* Fila 1, Columna 2 (Ocupa 1 espacio).  
   * *Detalle:* Lista ul/li con scroll interno si hay \> 5 elementos.  
3. **Estado del Equipo (TeamStatus)**  
   * *Ubicación:* components/domain/dashboard/widgets/team-status.tsx  
   * *Posición UI:* Fila 2, Span completo.  
4. **Panel de Configuración (DashboardSettings)**  
   * *Ubicación:* components/domain/dashboard/settings-drawer.tsx  
   * *Posición UI:* Sheet (Drawer) invisible hasta que se pulsa "Personalizar".

### **3.2. Módulo: Calendario (El Núcleo)**

**Ruta:** app/(dashboard)/calendar/page.tsx

**Distribución Visual:**

* **Header:** Barra de herramientas con selector de fechas y filtros (Top).  
* **Body:** Rejilla del calendario (Ocupa h-\[calc(100vh-theme(spacing.32))\]).

**Componentes y Ubicación:**

1. **Contenedor Principal (CalendarWrapper)**  
   * *Ubicación:* components/domain/calendar/calendar-view.tsx  
   * *Función:* Gestiona el estado de la vista (Día/Semana) y la fecha actual.  
2. **Barra de Herramientas (CalendarToolbar)**  
   * *Ubicación:* components/domain/calendar/toolbar/calendar-controls.tsx  
   * *Elementos:* DatePicker, botones "Hoy", "Semana/Día".  
3. **Filtros de Salas (RoomFilter)**  
   * *Ubicación:* components/domain/calendar/filters/room-filter-sidebar.tsx  
   * *Posición UI:* Panel colapsable a la izquierda o Popover en móvil.  
4. **Rejilla de Eventos (EventGrid)**  
   * *Ubicación:* components/domain/calendar/grid/day-view.tsx y week-view.tsx.  
   * *Lógica:* Implementación de react-big-calendar o Custom CSS Grid.  
5. **Modal de Reserva (BookingForm)**  
   * *Ubicación:* components/domain/bookings/forms/booking-sheet.tsx  
   * *Posición UI:* Sheet (Panel lateral derecho) que se desliza al hacer click en un slot o reserva.  
   * *Clave:* Contiene el StaffMultiSelect.

### **3.3. Módulo: Listado de Reservas (Gestión Tabular)**

**Ruta:** app/(dashboard)/bookings/page.tsx

**Componentes y Ubicación:**

1. **Tabla de Datos (BookingsTable)**  
   * *Ubicación:* components/domain/bookings/table/data-table.tsx  
   * *Lógica:* Instancia de @tanstack/react-table.  
2. **Definición de Columnas (Columns)**  
   * *Ubicación:* components/domain/bookings/table/columns.tsx  
   * *Contenido:* Define celdas para Status (Badges de colores), Fechas, Acciones (Dropdown menu).  
3. **Filtros Avanzados (TableFilters)**  
   * *Ubicación:* components/domain/bookings/table/table-toolbar.tsx  
   * *Elementos:* Input de búsqueda (texto), Faceted Filters (Estado, Sala).

### **3.4. Módulo: Informes (Reportes Financieros)**

**Ruta:** app/(dashboard)/reports/revenue/page.tsx

**Componentes y Ubicación:**

1. **Gráfico Principal (RevenueChart)**  
   * *Ubicación:* components/domain/reports/revenue-chart.tsx  
   * *Posición UI:* Parte superior, gran formato.  
2. **Selector de Modo (AccountingToggle)**  
   * *Ubicación:* components/domain/reports/controls/accounting-mode-switch.tsx  
   * *Función:* Switch "Caja" vs "Devengo".  
3. **Tabla de Desglose (RevenueTable)**  
   * *Ubicación:* components/domain/reports/revenue-table.tsx  
   * *Posición UI:* Debajo del gráfico.

### **3.5. Módulo: Juegos/Salas (Configuración)**

**Ruta:** app/(dashboard)/rooms/page.tsx

**Componentes y Ubicación:**

1. **Grid de Tarjetas (RoomsGrid)**  
   * *Ubicación:* components/domain/rooms/room-grid.tsx  
   * *Contenido:* Mapea RoomCard para cada sala activa.  
2. **Tarjeta de Sala (RoomCard)**  
   * *Ubicación:* components/domain/rooms/room-card.tsx  
   * *Visual:* Imagen de portada, Badges de dificultad/jugadores, botón "Editar".  
3. **Gestor de Horarios (ScheduleManager)**  
   * *Ubicación:* components/domain/rooms/forms/schedule-manager.tsx  
   * *Posición UI:* Dentro de la página de detalle/edición de sala (app/(dashboard)/rooms/\[id\]/page.tsx).

## **4\. 🌳 Árbol de Archivos del Proyecto (Scaffolding)**

Esta es la estructura exacta que debes crear en tu editor:

src/  
├── app/  
│   ├── (auth)/  
│   │   ├── login/page.tsx  
│   │   └── layout.tsx  
│   ├── (dashboard)/  
│   │   ├── page.tsx                  \<-- Dashboard Home  
│   │   ├── calendar/page.tsx         \<-- Calendario  
│   │   ├── bookings/page.tsx         \<-- Listado Reservas  
│   │   ├── rooms/  
│   │   │   ├── page.tsx              \<-- Listado Salas  
│   │   │   └── \[id\]/page.tsx         \<-- Edición Sala  
│   │   ├── reports/  
│   │   │   └── revenue/page.tsx      \<-- Reportes  
│   │   └── layout.tsx                \<-- SidebarProvider \+ Main Layout  
│   ├── layout.tsx                    \<-- Root (Fonts, QueryProvider)  
│   └── globals.css                   \<-- Tailwind Directives  
│  
├── components/  
│   ├── ui/                           \<-- shadcn/ui (Button, Input, Sheet...)  
│   ├── layout/  
│   │   ├── sidebar/  
│   │   │   ├── app-sidebar.tsx  
│   │   │   └── nav-item.tsx  
│   │   └── header/  
│   │       └── mobile-nav.tsx  
│   └── domain/                       \<-- Lógica de Negocio  
│       ├── bookings/  
│       │   ├── forms/  
│       │   │   ├── booking-sheet.tsx  
│       │   │   └── staff-select.tsx  \<-- Multi-select  
│       │   └── table/  
│       │       ├── data-table.tsx  
│       │       └── columns.tsx  
│       ├── calendar/  
│       │   ├── calendar-view.tsx  
│       │   ├── grid/  
│       │   │   └── day-column.tsx  
│       │   └── filters/  
│       │       └── room-toggle.tsx  
│       ├── dashboard/  
│       │   └── widgets/  
│       │       ├── revenue-widget.tsx  
│       │       └── upcoming-list.tsx  
│       └── reports/  
│           └── revenue-chart.tsx  
│  
├── lib/  
│   ├── api/  
│   │   ├── client.ts                 \<-- Configuración Axios/Fetch  
│   │   └── endpoints.ts              \<-- Constantes de URL  
│   ├── hooks/  
│   │   ├── use-bookings.ts           \<-- React Query Hooks  
│   │   └── use-auth.ts  
│   └── utils.ts                      \<-- cn() helper  
│  
└── stores/  
    └── ui-store.ts                   \<-- Zustand (Sidebar open, etc)

## **5\. 🛠️ Detalles de Implementación Críticos**

### **5.1. Estado Global (Zustand)**

Ubicación: src/stores/ui-store.ts

interface UIState {  
  isSidebarOpen: boolean;  
  toggleSidebar: () \=\> void;  
  calendarView: 'day' | 'week'; // Persistencia de vista preferida  
  setCalendarView: (view: 'day' | 'week') \=\> void;  
}

### **5.2. Cliente API (Axios \+ Interceptores)**

Ubicación: src/lib/api/client.ts

* Debe inyectar automáticamente el token de Supabase en Authorization: Bearer ....  
* Debe manejar errores 401 para redirigir al login.

### **5.3. Tipos TypeScript**

Ubicación: src/types/api.ts

* Exportar interfaces que coincidan 1:1 con los esquemas Pydantic del backend (Booking, Room, User).

## **6\. Siguientes Pasos (Ejecución)**

1. **Scaffolding:** Crea la estructura de carpetas components/domain vacía.  
2. **Primitivas:** Instala shadcn/ui (npx shadcn@latest init).  
3. **Layout:** Implementa app-sidebar.tsx y conéctalo en app/(dashboard)/layout.tsx.  
4. **Conexión API:** Configura lib/api/client.ts y prueba un fetch simple en el Dashboard.
## **7. 🐛 Correcciones y Mejoras (8 de Diciembre 2025)**

### **7.1. Autenticación (Backend - escapemaster-api)**
* **Normalización de Email:** Se implementó `email.lower().strip()` en `auth_service.py` (métodos `forgot_password` y `reset_password`) para evitar errores por mayúsculas/espacios.
* **Búsqueda Insensible a Mayúsculas:** Se cambió la consulta de usuario a `User.email.ilike(email)` para mayor robustez.
* **Depuración:** Se añadieron logs detallados en el flujo de reset de contraseña.

### **7.2. Autenticación (Frontend - escapemaster-web)**
* **Normalización de Input:** En `src/app/(auth)/forgot-password/page.tsx`, el email ingresado se convierte a minúsculas antes de enviarlo a la API.

### **3.4. Módulo: Reportes y Finanzas (Analytics)**

**Ruta:** app/(dashboard)/reports/page.tsx

**Distribución Visual:**
* **Header:** Título, Filtros de Fecha (Select + Custom Range), Botones de Acción (Exportar, Registrar Gasto, Crear Gráfica).
* **KPIs:** Grid de 4 tarjetas con indicadores financieros y operativos (Ingresos, Beneficio, Gastos, Cancelación).
* **Gráficos:** Grid de 2 columnas con visualizaciones (Barras, Áreas, Pie Charts).
* **Tablas:** Listado de últimas transacciones.

**Componentes y Ubicación:**
* Todo el contenido actual reside en `page.tsx` como un componente monolítico (refactorización pendiente a componentes atómicos en `components/domain/reports/`).
* **Modales:** Formularios integrados para "Registrar Gasto" y "Crear Gráfica".
