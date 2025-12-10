import { StatsCards } from "./widgets/stats-cards";
import { UpcomingSessions } from "./widgets/upcoming-sessions";
import { TeamStatus } from "./widgets/team-status";
import { RevenueWidget } from "./widgets/revenue-widget";
import { CalendarWidget } from "./widgets/calendar-widget";
import { NotesWidget } from "./widgets/notes-widget";
import { RevenueBarChartWidget } from "./widgets/revenue-bar-chart";
import { OccupancyPieChartWidget } from "./widgets/occupancy-pie-chart";
import { QuarterlyStatsWidget } from "./widgets/quarterly-stats";
import { RevenueTableWidget } from "./widgets/revenue-table";
import { WidgetDefinition } from "./types";

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  stats: {
    type: "stats",
    title: "Estadísticas Generales",
    description: "Resumen de reservas, ingresos y ocupación",
    component: StatsCards,
    defaultColSpan: 48,
    defaultRowSpan: 6,
  },
  upcoming: {
    type: "upcoming",
    title: "Próximas Sesiones",
    description: "Lista de las próximas sesiones programadas",
    component: UpcomingSessions,
    defaultColSpan: 24,
    defaultRowSpan: 20,
  },
  team: {
    type: "team",
    title: "Estado del Equipo",
    description: "Disponibilidad y estado actual de los empleados",
    component: TeamStatus,
    defaultColSpan: 12,
    defaultRowSpan: 12,
  },
  revenue: {
    type: "revenue",
    title: "Ingresos (Simple)",
    description: "Gráfico de ingresos mensuales simple",
    component: RevenueWidget,
    defaultColSpan: 24,
    defaultRowSpan: 12,
  },
  calendar: {
    type: "calendar",
    title: "Calendario",
    description: "Vista de calendario mensual/semanal",
    component: CalendarWidget,
    defaultColSpan: 12,
    defaultRowSpan: 16,
  },
  notes: {
    type: "notes",
    title: "Notas Rápidas",
    description: "Bloc de notas simple",
    component: NotesWidget,
    defaultColSpan: 12,
    defaultRowSpan: 8,
  },
  "revenue-chart": {
    type: "revenue-chart",
    title: "Gráfico Ingresos vs Gastos",
    description: "Comparativa mensual de ingresos y gastos",
    component: RevenueBarChartWidget,
    defaultColSpan: 24,
    defaultRowSpan: 16,
  },
  "occupancy-chart": {
    type: "occupancy-chart",
    title: "Ocupación por Sala",
    description: "Distribución de reservas por sala",
    component: OccupancyPieChartWidget,
    defaultColSpan: 12,
    defaultRowSpan: 14,
  },
  "quarterly-stats": {
    type: "quarterly-stats",
    title: "Resumen Trimestral",
    description: "KPIs principales del trimestre actual",
    component: QuarterlyStatsWidget,
    defaultColSpan: 24,
    defaultRowSpan: 12,
  },
  "revenue-table": {
    type: "revenue-table",
    title: "Registro de Transacciones",
    description: "Tabla detallada de ingresos con filtros",
    component: RevenueTableWidget,
    defaultColSpan: 48,
    defaultRowSpan: 20,
  },
};
