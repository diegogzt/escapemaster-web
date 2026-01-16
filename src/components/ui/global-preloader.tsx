"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useAuthStore } from "@/stores/auth-store";

export function GlobalPreloader() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Iniciando...");
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  
  const { fetchBookings, fetchSummary, fetchStats, bookingsLastFetched } = useDashboardStore();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    // Hot cache check
    const now = Date.now();
    if (bookingsLastFetched && (now - bookingsLastFetched < 60000)) { 
       setIsVisible(false);
       return;
    }

    const loadData = async () => {
      try {
        setProgress(10);
        setMessage("Verificando sesión...");
        
        // Fetch User first (fast usually)
        await fetchUser().catch(() => {});
        setProgress(20);

        setMessage("Cargando dashboard...");
        
        // Parallel fetches
        const p1 = fetchBookings();
        const p2 = fetchSummary();
        const p3 = fetchStats('month');
        
        p1.then(() => setProgress(prev => Math.max(prev, 60))).catch(() => {});
        p2.then(() => setProgress(prev => Math.max(prev, 80))).catch(() => {});
        p3.then(() => setProgress(prev => Math.max(prev, 90))).catch(() => {});
        
        await Promise.allSettled([p1, p2, p3]);
        
        setProgress(100);
        setMessage("¡Listo!");
        
        // Trigger fade out
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => setIsVisible(false), 500); // Wait for transition
        }, 500);
        
      } catch (error) {
        console.error("Dashboard preloading failed", error);
        setIsVisible(false);
      }
    };

    loadData();
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-background)]/90 backdrop-blur-md transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="w-full max-w-md p-8 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
          EscapeMaster
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[var(--color-beige)] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-[var(--color-muted-foreground)] transition-all">
          {message}
        </p>
      </div>
    </div>
  );
}
