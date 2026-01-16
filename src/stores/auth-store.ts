import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  role?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastFetched: number | null;
  
  // Actions
  fetchUser: (force?: boolean) => Promise<User | null>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      lastFetched: null,

      fetchUser: async (force = false) => {
        const { user, lastFetched } = get();
        const now = Date.now();

        // Cache for 1 hour if not forced
        if (!force && user && lastFetched && (now - lastFetched < 3600000)) {
          return user;
        }

        try {
          const userData = await auth.me();
          set({ 
            user: userData, 
            isAuthenticated: true, 
            lastFetched: now 
          });
          return userData;
        } catch (error) {
          console.error("Auth store fetch failed", error);
          // If 401, handle logout? api.ts interceptor handles strictly 401 redirects.
          // But we should update state.
          // set({ user: null, isAuthenticated: false }); 
          throw error;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true, lastFetched: Date.now() }),
      
      logout: () => {
        set({ user: null, isAuthenticated: false, lastFetched: null });
        localStorage.removeItem('token'); 
      }
    }),
    {
      name: 'escapemaster-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        lastFetched: state.lastFetched
      }),
    }
  )
);
