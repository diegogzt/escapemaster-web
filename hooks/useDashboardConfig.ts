import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WidgetId =
  | "stats_summary"
  | "quick_actions"
  | "upcoming_bookings"
  | "monthly_stats"
  | "revenue_chart"
  | "bookings_chart"
  | "top_rooms_chart"
  | "occupancy_widget";

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  enabled: boolean;
}

interface DashboardConfigState {
  widgets: WidgetConfig[];
  setWidgets: (widgets: WidgetConfig[]) => void;
  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stats_summary", title: "Resumen de Hoy", enabled: true },
  { id: "quick_actions", title: "Acciones Rápidas", enabled: true },
  { id: "upcoming_bookings", title: "Próximas Reservas", enabled: true },
  { id: "monthly_stats", title: "Estadísticas del Mes", enabled: true },
  { id: "revenue_chart", title: "Gráfico de Ingresos", enabled: true },
  { id: "bookings_chart", title: "Gráfico de Reservas", enabled: false },
  { id: "top_rooms_chart", title: "Salas Populares", enabled: false },
  { id: "occupancy_widget", title: "Tasa de Ocupación", enabled: false },
];

export const useDashboardConfig = create<DashboardConfigState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      setWidgets: (widgets) => set({ widgets }),
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        })),
      reorderWidgets: (fromIndex, toIndex) =>
        set((state) => {
          const newWidgets = [...state.widgets];
          const [removed] = newWidgets.splice(fromIndex, 1);
          newWidgets.splice(toIndex, 0, removed);
          return { widgets: newWidgets };
        }),
    }),
    {
      name: "dashboard-config-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
