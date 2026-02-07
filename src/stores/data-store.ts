import { create } from "zustand";
import { persist } from "zustand/middleware";
import { rooms as roomsApi, roles as rolesApi, users as usersApi } from "@/services/api";

interface DataState {
  // Global Data
  rooms: any[];
  roles: any[];
  users: any[];
  isLoaded: {
    rooms: boolean;
    roles: boolean;
    users: boolean;
  };
  
  // Actions
  fetchRooms: (force?: boolean) => Promise<void>;
  fetchRoles: (force?: boolean) => Promise<void>;
  fetchUsers: (force?: boolean) => Promise<void>;
  
  // Module Specific States (Persistence)
  bookingsState: {
    filters: any;
    data: any[];
    scrollPos: number;
    lastFetched: number | null;
  };
  setBookingsState: (state: Partial<DataState["bookingsState"]>) => void;
  
  dashboardState: {
    widgets: any[];
    lastFetched: number | null;
  };
  setDashboardState: (state: Partial<DataState["dashboardState"]>) => void;

  calendarState: {
    view: "month" | "week" | "day";
    currentDate: string; // ISO string
    sessions: any[];
    lastFetched: number | null;
  };
  setCalendarState: (state: Partial<DataState["calendarState"]>) => void;

  timeTrackingState: {
    summary: any;
    entries: any[];
    vacations: any[];
    lastFetched: number | null;
  };
  setTimeTrackingState: (state: Partial<DataState["timeTrackingState"]>) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      rooms: [],
      roles: [],
      users: [],
      isLoaded: {
        rooms: false,
        roles: false,
        users: false,
      },

      fetchRooms: async (force = false) => {
        if (get().isLoaded.rooms && !force) return;
        try {
          const data = await roomsApi.list();
          const list = Array.isArray(data?.rooms) ? data.rooms : (Array.isArray(data) ? data : []);
          set((state) => ({ 
            rooms: list, 
            isLoaded: { ...state.isLoaded, rooms: true } 
          }));
        } catch (error) {
          console.error("Error fetching rooms in store:", error);
        }
      },

      fetchRoles: async (force = false) => {
        if (get().isLoaded.roles && !force) return;
        try {
          const data = await rolesApi.list();
          const list = Array.isArray(data?.roles) ? data.roles : (Array.isArray(data) ? data : []);
          set((state) => ({ 
            roles: list, 
            isLoaded: { ...state.isLoaded, roles: true } 
          }));
        } catch (error) {
          console.error("Error fetching roles in store:", error);
        }
      },

      fetchUsers: async (force = false) => {
        if (get().isLoaded.users && !force) return;
        try {
          const data = await usersApi.list();
          const list = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
          set((state) => ({ 
            users: list, 
            isLoaded: { ...state.isLoaded, users: true } 
          }));
        } catch (error) {
          console.error("Error fetching users in store:", error);
        }
      },

      // Persistence for Bookings
      bookingsState: {
        filters: {
          searchTerm: "",
          statusFilter: "all",
          roomFilter: "all",
          dateFilterType: "all",
          page: 1,
          pageSize: 20
        },
        data: [],
        scrollPos: 0,
        lastFetched: null,
      },
      setBookingsState: (newState) => set((state) => ({
        bookingsState: { ...state.bookingsState, ...newState }
      })),

      // Persistence for Dashboard
      dashboardState: {
        widgets: [],
        lastFetched: null,
      },
      setDashboardState: (newState) => set((state) => ({
        dashboardState: { ...state.dashboardState, ...newState }
      })),

      calendarState: {
        view: "month",
        currentDate: new Date().toISOString(),
        sessions: [],
        lastFetched: null,
      },
      setCalendarState: (newState) => set((state) => ({
        calendarState: { ...state.calendarState, ...newState }
      })),

      timeTrackingState: {
        summary: null,
        entries: [],
        vacations: [],
        lastFetched: null,
      },
      setTimeTrackingState: (newState) => set((state) => ({
        timeTrackingState: { ...state.timeTrackingState, ...newState }
      })),
    }),
    {
      name: "escapemaster-data-storage",
      partialize: (state) => ({
        // Only persist these parts
        bookingsState: { filters: state.bookingsState.filters },
        rooms: state.rooms,
        roles: state.roles,
        isLoaded: state.isLoaded
      }),
    }
  )
);
