import { create } from 'zustand';
import { bookings as bookingsApi, dashboard as dashboardApi } from '@/services/api';

interface DashboardState {
  bookings: any[];
  bookingsLastFetched: number | null;
  summary: any | null;
  summaryLastFetched: number | null;
  stats: any | null;
  statsLastFetched: number | null; // We might need a map if stats depend on period
  revenue: any | null;
  
  // Actions
  fetchBookings: (force?: boolean) => Promise<any[]>;
  fetchSummary: (force?: boolean) => Promise<any>;
  fetchStats: (period?: string, force?: boolean) => Promise<any>;
  invalidateAll: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>((set, get) => ({
  bookings: [],
  bookingsLastFetched: null,
  summary: null,
  summaryLastFetched: null,
  stats: null,
  statsLastFetched: null,
  revenue: null,

  fetchBookings: async (force = false) => {
    const { bookings, bookingsLastFetched } = get();
    const now = Date.now();
    
    // Return cached if fresh
    if (!force && bookingsLastFetched && (now - bookingsLastFetched < CACHE_DURATION) && bookings.length > 0) {
      return bookings;
    }

    try {
      const response = await bookingsApi.list();
      // Handle the object response structure if needed, similar to widget fix
      const list = response.bookings || (Array.isArray(response) ? response : []);
      set({ bookings: list, bookingsLastFetched: now });
      return list;
    } catch (error) {
       console.error("Store: fetchBookings failed", error);
       throw error;
    }
  },

  fetchSummary: async (force = false) => {
    const { summary, summaryLastFetched } = get();
    const now = Date.now();

    if (!force && summaryLastFetched && (now - summaryLastFetched < CACHE_DURATION) && summary) {
      return summary;
    }

    try {
      const data = await dashboardApi.getSummary();
      set({ summary: data, summaryLastFetched: now });
      return data;
    } catch (error) {
      console.error("Store: fetchSummary failed", error);
      throw error;
    }
  },

  fetchStats: async (period = 'month', force = false) => {
    // For stats, since it changes by period, basic single-slot cache might be insufficient if user switches often.
    // But for MVP, let's cache the last request. 
    // Ideally we'd store `statsCache: { [period]: { data, timestamp } }`
    // Let's implement simple cache for now, optimizing "dashboard load" which usually defaults to "month".
    
    // TODO: Improve to period-based cache if needed.
    try {
        const data = await dashboardApi.getStats(period);
        set({ stats: data });
        return data;
    } catch (error) {
        throw error;
    }
  },

  invalidateAll: () => set({
    bookingsLastFetched: null,
    summaryLastFetched: null,
    statsLastFetched: null
  })
}));
