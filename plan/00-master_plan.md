# Plan Maestro: Corrección de Issues de Auditoría Visual

## Objetivo Global
Corregir las 7 issues identificadas en la auditoría visual del Manager, priorizando la experiencia móvil y la navegación completa de la aplicación.

## Issues a Resolver (por prioridad)

| # | Issue | Prioridad | Agente |
|---|-------|-----------|--------|
| 1 | Ausencia de menú hamburguesa en móvil | 🔴 Alta | Frontend |
| 2 | Barra inferior con solo 5 accesos | 🔴 Alta | Frontend |
| 3 | Tablas HTML no adaptadas a móvil (Reservas) | 🟡 Media | Frontend |
| 4 | Padding insuficiente en móvil (contenido toca bordes) | 🟡 Media | Frontend |
| 5 | Sidebar no colapsa en tablet (768px) | 🟡 Media | Frontend |
| 6 | Baja densidad en widgets Dashboard (espacio muerto) | 🟢 Baja | Frontend |
| 7 | Buscador excesivamente largo en Desktop | 🟢 Baja | Frontend |

## Agentes Necesarios

### 1. Agente Frontend (Frontend Developer)
**Responsabilidad**: Corregir todos los problemas de UI/UX responsivo.
**Plan**: `01-frontend_plan.md`

### 2. Agente QA (QA Tester)
**Responsabilidad**: Verificar las correcciones en los 4 viewports (PC, Laptop, Tablet, Móvil).
**Plan**: `02-qa_plan.md`

## Orden de Ejecución
1. **Agente Frontend** ejecuta las correcciones (issues 1→7 en orden de prioridad).
2. **Agente QA** verifica en browser todas las correcciones en los 4 viewports.
3. Deploy a producción y validación final.

> [!NOTE]
> No se necesita Agente Backend ni Agente de Arquitectura — todos los problemas son de CSS/componentes React.
