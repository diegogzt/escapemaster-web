import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetConfig } from '@/components/domain/dashboard/types';

interface DashboardLayoutState {
  widgets: WidgetConfig[];
  activeCollectionId: string | null;
  actions: {
    setWidgets: (widgets: WidgetConfig[]) => void;
    updateWidgetConfig: (id: string, config: any) => void;
    setActiveCollectionId: (id: string | null) => void;
    resetLayout: (defaultLayout: WidgetConfig[]) => void;
  };
}

// Updated default layout with higher resolution values (12 columns, 10px rows)
export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "stats-1", type: "stats", colSpan: 48, rowSpan: 6 },
  { id: "quarterly-1", type: "quarterly-stats", colSpan: 24, rowSpan: 12 },
  { id: "revenue-chart-1", type: "revenue-chart", colSpan: 24, rowSpan: 16 },
  { id: "upcoming-1", type: "upcoming", colSpan: 24, rowSpan: 20 },
  { id: "occupancy-1", type: "occupancy-chart", colSpan: 12, rowSpan: 14 },
  { id: "calendar-1", type: "calendar", colSpan: 12, rowSpan: 16 },
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
            widgets: state.widgets.map((w) =>
              w.id === id ? { ...w, config: { ...w.config, ...config } } : w
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
