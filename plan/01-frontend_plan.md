# Plan del Agente Frontend (Frontend Developer)

## Resumen de Responsabilidades
Corregir todos los problemas de UI/UX responsivo detectados en la auditoría, con foco en la experiencia móvil.

---

## Issue 1: Menú Hamburguesa en Móvil (CRÍTICO)

### Archivo a modificar
- `src/components/layout/header/mobile-nav.tsx`

### Cambios
El header móvil actual solo muestra el logo "EscapeMaster". Necesita un botón hamburguesa que despliegue un `Sheet` (drawer lateral) con **toda la navegación** que tiene `app-sidebar.tsx`.

**Implementación:**
1. Importar `Sheet`, `SheetTrigger`, `SheetContent` de `@/components/ui/sheet` (o crear un drawer con estado).
2. Añadir un icono `Menu` (lucide) a la izquierda del header.
3. Dentro del Sheet, renderizar los mismos `navItems` y grupos que usa `app-sidebar.tsx` (Operaciones, Personal, Gestión).
4. Incluir la sección de usuario (nombre, rol, logout) en la parte inferior del drawer.

### Casos límite
- El drawer debe cerrarse al navegar a una nueva ruta (usar `usePathname` para detectar cambios).
- Respetar los permisos de usuario (`hasPermission`) igual que el sidebar.

---

## Issue 2: Barra Inferior — Añadir botón "Más"

### Archivo a modificar
- `src/components/layout/bottom-nav.tsx`

### Cambios
La barra inferior actual tiene 5 items fijos. Se reemplazará el último item ("Reportes") por un botón "Más" que abra el mismo Sheet/drawer del Issue 1.

**Implementación:**
1. Mantener 4 items: Inicio, Cal, Reservas, Salas.
2. El 5º item será "Más" con icono `MoreHorizontal` que abre el drawer completo.
3. Reutilizar o compartir el componente de navegación del drawer creado en Issue 1.

---

## Issue 3: Card View para Reservas en Móvil

### Archivos a modificar
- `src/app/(dashboard)/bookings/page.tsx` o el componente de lista de reservas

### Cambios
Implementar un renderizado condicional:
```
if (viewport < 640px) → renderizar BookingCard
else → renderizar tabla HTML actual
```

**BookingCard** debe mostrar: Fecha/Hora, Sala (con badge de color), Estado (badge), y acciones (botón puntitos).

### Casos límite
- La vista de tarjetas debe mantener la misma funcionalidad (editar, cancelar) que las acciones de la tabla.
- Asegurar que la paginación funcione igual en ambas vistas.

---

## Issue 4: Padding Global en Móvil

### Archivos a modificar
- `src/app/(dashboard)/layout.tsx` o CSS global
- `src/app/globals.css`

### Cambios
Añadir un padding de seguridad lateral de `16px` en viewports `< 768px`:
```css
@media (max-width: 767px) {
  .main-content { padding-left: 16px; padding-right: 16px; }
}
```

---

## Issue 5: Slim Sidebar en Tablet

### Archivos a modificar
- `src/components/layout/sidebar/app-sidebar.tsx`

### Cambios
El sidebar ya tiene un mecanismo `isCollapsed`. Necesita un breakpoint automático:
- `>= 1024px`: Sidebar expandido (actual).
- `768px–1023px`: Sidebar colapsado (solo iconos, ~64px de ancho).
- `< 768px`: Sidebar oculto (ya funciona así).

**Implementación:**
1. Añadir un `useEffect` con `window.matchMedia('(max-width: 1023px)')` que auto-colapse.
2. Asegurar que los tooltips se muestren al hover en modo colapsado para mantener la usabilidad.

---

## Issue 6: Densidad de Widgets del Dashboard

### Archivos a modificar
- `src/components/views/DashboardView.tsx` y los componentes de stat cards

### Cambios
- Redistribuir el contenido de las stat cards para que el número + label ocupe más espacio vertical (centrado).
- Añadir un indicador de tendencia (flecha arriba/abajo + porcentaje) para llenar el espacio vacío.
- Ajustar la grid de 4 columnas a 2 columnas en tablet, 1 columna en móvil.

---

## Issue 7: Max-width del Buscador

### Archivos a modificar
- `src/app/(dashboard)/bookings/page.tsx` (componente de búsqueda)

### Cambios
Limitar el ancho máximo de la barra de búsqueda a `max-width: 600px` para que no se estire infinitamente en pantallas anchas.

---

## Secuencia de Ejecución
1. Issue 1 + Issue 2 (van juntas — el drawer se comparte)
2. Issue 5 (Slim Sidebar)
3. Issue 4 (Padding global)
4. Issue 3 (Card View Reservas)
5. Issues 6–7 (Mejoras visuales de menor prioridad)
