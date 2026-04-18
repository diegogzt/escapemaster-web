import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetConfig } from '@/components/domain/dashboard/types';
import { users } from '@/services/api';

interface DashboardLayoutState {
  widgets: WidgetConfig[];
  activeCollectionId: string | null;
  isSyncing: boolean;
  actions: {
    setWidgets: (widgets: WidgetConfig[]) => void;
    updateWidgetConfig: (id: string, config: any) => void;
    updateWidgetLayout: (id: string, layout: Partial<WidgetConfig>) => void;
    setActiveCollectionId: (id: string | null) => void;
    resetLayout: (defaultLayout: WidgetConfig[]) => void;
    syncWithApi: () => Promise<void>;
    loadFromApi: () => Promise<void>;
  };
}

// Default layout - strategic first, tactical second, accessory hidden by default
// Layer 1 (Strategic): KPIs esenciales - ingresos, reservas, ocupación
// Layer 2 (Tactical): Acciones inmediatas - próximas sesiones, calendario
// Layer 3 (Accessory): Información complementaria - equipo, cupones, notas
export const DEFAULT_LAYOUT: WidgetConfig[] = [
  // Capa 1: Métricas estratégicas (arriba, prominentes)
  { id: "stats-1", type: "stats", colSpan: 6, rowSpan: 3 },
  // Capa 2: Vista operacional
  { id: "upcoming-1", type: "upcoming", colSpan: 3, rowSpan: 7 },
  { id: "revenue-1", type: "revenue", colSpan: 3, rowSpan: 4 },
  // Capa 3: Análisis y calendario
  { id: "calendar-1", type: "calendar", colSpan: 2, rowSpan: 6 },
  { id: "occupancy-1", type: "occupancy-chart", colSpan: 2, rowSpan: 6 },
  { id: "projected-1", type: "projected", colSpan: 2, rowSpan: 4 },
];

// Helper to get token
const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_LAYOUT,
      activeCollectionId: null,
      isSyncing: false,
      actions: {
        setWidgets: (widgets) => {
          set({ widgets });
          get().actions.syncWithApi();
        },
        updateWidgetConfig: (id, config) => {
          set((state) => ({
            widgets: (state.widgets || []).map((w) =>
              w.id === id ? { ...w, config: { ...w.config, ...config } } : w
            ),
          }));
          get().actions.syncWithApi();
        },
        updateWidgetLayout: (id, layout) => {
          set((state) => ({
            widgets: (state.widgets || []).map((w) =>
              w.id === id ? { ...w, ...layout } : w
            ),
          }));
          get().actions.syncWithApi();
        },
        setActiveCollectionId: (id) => {
          set({ activeCollectionId: id });
          get().actions.syncWithApi();
        },
        resetLayout: (defaultLayout) => {
          set({ widgets: defaultLayout || DEFAULT_LAYOUT });
          get().actions.syncWithApi();
        },
        syncWithApi: async () => {
          if (!isAuthenticated() || get().isSyncing) return;

          set({ isSyncing: true });
          try {
            const { widgets, activeCollectionId } = get();
            await users.updateUiPreferences({
              widgets: widgets as unknown as any[],
              active_collection_id: activeCollectionId ?? undefined,
            });
          } catch (error) {
            console.error("Failed to sync dashboard layout to API:", error);
          } finally {
            set({ isSyncing: false });
          }
        },
        loadFromApi: async () => {
          if (!isAuthenticated()) return;

          try {
            const prefs = await users.getUiPreferences();

            // Apply widgets from API if available
            if (prefs.widgets && Array.isArray(prefs.widgets) && prefs.widgets.length > 0) {
              set({ widgets: prefs.widgets as unknown as WidgetConfig[] });
            }

            // Apply activeCollectionId from API if available
            if (prefs.active_collection_id !== undefined) {
              set({ activeCollectionId: prefs.active_collection_id });
            }
          } catch (error) {
            console.error("Failed to load dashboard layout from API:", error);
          }
        },
      },
    }),
    {
      name: 'dashboard-layout-storage',
      partialize: (state) => ({
        widgets: state.widgets,
        activeCollectionId: state.activeCollectionId
      }),
    }
  )
);

export const useDashboardLayoutActions = () => useDashboardLayoutStore((state) => state.actions);

// Auto-load from API when authenticated
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    setTimeout(() => {
      useDashboardLayoutStore.getState().actions.loadFromApi();
    }, 100);
  }
}
