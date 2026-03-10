import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetConfig } from '@/components/domain/dashboard/types';

interface DashboardLayoutState {
  widgets: WidgetConfig[];
  activeCollectionId: string | null;
  actions: {
    setWidgets: (widgets: WidgetConfig[]) => void;
    updateWidgetConfig: (id: string, config: any) => void;
    updateWidgetLayout: (id: string, layout: Partial<WidgetConfig>) => void;
    setActiveCollectionId: (id: string | null) => void;
    resetLayout: (defaultLayout: WidgetConfig[]) => void;
  };
}

// Default layout using the 6-column grid system
export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "stats-1", type: "stats", colSpan: 6, rowSpan: 3 },
  { id: "quarterly-1", type: "quarterly-stats", colSpan: 3, rowSpan: 4 },
  { id: "revenue-chart-1", type: "revenue-chart", colSpan: 3, rowSpan: 6 },
  { id: "upcoming-1", type: "upcoming", colSpan: 3, rowSpan: 7 },
  { id: "occupancy-1", type: "occupancy-chart", colSpan: 2, rowSpan: 6 },
  { id: "calendar-1", type: "calendar", colSpan: 2, rowSpan: 6 },
  { id: "fiscal-1", type: "fiscal", colSpan: 3, rowSpan: 4 },
  { id: "projected-1", type: "projected", colSpan: 2, rowSpan: 4 },
];

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_LAYOUT,
      activeCollectionId: null,
      actions: {
        setWidgets: (widgets) => set({ widgets }),
        updateWidgetConfig: (id, config) =>
          set((state) => ({
            widgets: (state.widgets || []).map((w) =>
              w.id === id ? { ...w, config: { ...w.config, ...config } } : w
            ),
          })),
        updateWidgetLayout: (id, layout) =>
          set((state) => ({
            widgets: (state.widgets || []).map((w) =>
              w.id === id ? { ...w, ...layout } : w
            ),
          })),
        setActiveCollectionId: (id) => set({ activeCollectionId: id }),
        resetLayout: (defaultLayout) => set({ widgets: defaultLayout || DEFAULT_LAYOUT }),
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
