import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  calendarView: "day" | "week";
  setCalendarView: (view: "day" | "week") => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  calendarView: "week",
  setCalendarView: (view) => set({ calendarView: view }),
  activeView: "dashboard",
  setActiveView: (view) => set({ activeView: view }),
}));
