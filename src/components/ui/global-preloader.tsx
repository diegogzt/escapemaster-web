"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";

export function GlobalPreloader() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Iniciando...");
  const [isVisible, setIsVisible] = useState(true);
  
  const { fetchBookings, fetchSummary, fetchStats, bookingsLastFetched } = useDashboardStore();

  useEffect(() => {
    // If we have recent data, skip animation to feel "instant"
    const now = Date.now();
    if (bookingsLastFetched && (now - bookingsLastFetched < 60000)) { // 1 min hot cache skip
       setIsVisible(false);
       return;
    }

    const loadData = async () => {
      try {
        // Step 1: Start
        setProgress(10);
        setMessage("Conectando con EscapeMaster...");
        
        // Step 2: Parallel fetch crucial data
        setMessage("Cargando dashboard...");
        setProgress(30);
        
        // Artificial delay for slickness if it's TOO fast (user wants to see the animation)
        // But let's prioritize speed. If it's fast, good.
        
        const p1 = fetchBookings();
        const p2 = fetchSummary();
        const p3 = fetchStats('month'); // Default stats
        
        // We can await them individually to update progress
        p1.then(() => setProgress(prev => Math.max(prev, 60)));
        p2.then(() => setProgress(prev => Math.max(prev, 80)));
        p3.then(() => setProgress(prev => Math.max(prev, 90)));
        
        await Promise.all([p1, p2, p3]);
        
        setProgress(100);
        setMessage("¡Listo!");
        
        // Small delay to show 100%
        setTimeout(() => setIsVisible(false), 500);
        
      } catch (error) {
        console.error("Dashboard preloading failed", error);
        // On error, still dismiss to allow retry/UI access
        setIsVisible(false);
      }
    };

    loadData();
  }, []); // Run once on mount

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-background)]/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-8 flex flex-col items-center gap-6"
          >
            {/* Logo Placeholder */}
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              EscapeMaster
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[var(--color-beige)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {/* Message */}
            <motion.p
              key={message}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm font-medium text-[var(--color-muted-foreground)]"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
