import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  calendarView: "day" | "week";
  setCalendarView: (view: "day" | "week") => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  calendarView: "week",
  setCalendarView: (view) => set({ calendarView: view }),
}));
