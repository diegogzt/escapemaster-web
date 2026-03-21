# Plan del Agente QA (QA Tester)

## Resumen de Responsabilidades
Verificar todas las correcciones del Agente Frontend en los 4 viewports de la auditoría original, asegurando que no se introduzcan regresiones.

---

## Matriz de Verificación

| Issue | PC (1920) | Laptop (1366) | Tablet (768) | Móvil (375) |
|-------|-----------|---------------|--------------|-------------|
| 1. Menú hamburguesa | N/A | N/A | N/A | ✅ Funciona, abre drawer con toda la nav |
| 2. Botón "Más" en bottom-nav | N/A | N/A | N/A | ✅ Reemplaza "Reportes", abre drawer |
| 3. Card View Reservas | N/A | N/A | N/A | ✅ Tarjetas en lugar de tabla |
| 4. Padding global | N/A | N/A | N/A | ✅ 16px de margen lateral |
| 5. Slim Sidebar | ✅ Expandido | ✅ Expandido | ✅ Solo iconos | N/A (oculto) |
| 6. Densidad widgets | ✅ Centrado | ✅ Centrado | ✅ 2 cols | ✅ 1 col |
| 7. Max-width buscador | ✅ ≤600px | ✅ ≤600px | N/A | N/A |

## Procedimiento de Verificación

### 1. Test Automatizado (Browser Subagent)
Para cada viewport, el agente QA debe:
1. Resize la ventana al viewport correspondiente.
2. Navegar a `/dashboard`, `/bookings`, `/rooms`.
3. Capturar screenshot.
4. Verificar visualmente que no hay overflow, truncamiento ni elementos ocultos.

### 2. Test de Navegación Móvil (375px)
1. Verificar que el botón `☰` aparece en el header.
2. Click en `☰` → verificar que se abre un drawer con **todas** las secciones.
3. Click en una sección secundaria (e.g., "Usuarios") → verificar que navega correctamente.
4. Verificar que el drawer se cierra tras la navegación.

### 3. Test de Regresión
En cada viewport, confirmar que:
- El login funciona.
- Los datos del dashboard cargan (no hay errores 500).
- La sidebar (cuando visible) mantiene toda su funcionalidad.

## Criterios de Aceptación
- **0 desbordamientos horizontales** en viewport 375px.
- **100% de secciones accesibles** en viewport 375px (vía drawer).
- **0 regresiones** en viewports desktop (1920px, 1366px).
