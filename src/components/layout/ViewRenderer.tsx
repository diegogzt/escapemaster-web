"use client";

import React, { useMemo } from "react";
import { useUIStore } from "@/stores/ui-store";
import { DashboardView } from "@/components/views/DashboardView";
import { CalendarView } from "@/components/views/CalendarView";
import { BookingsView } from "@/components/views/BookingsView";
import { TimeTrackingView } from "@/components/views/TimeTrackingView";
import { usePathname } from "next/navigation";
import { GlobalPreloader } from "@/components/ui/global-preloader";

// Views that we want to keep alive
const PERSISTENT_PATHS = ["/dashboard", "/calendar", "/bookings", "/time-tracking"];

export function ViewRenderer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeView } = useUIStore();

  // If we are on a persistent path, we want to show the persistent version
  const isPersistent = PERSISTENT_PATHS.includes(pathname);

  return (
    <div className="relative w-full h-full">
      {/* Persistent Views Shell */}
      <div className={isPersistent ? "block" : "hidden"}>
        <div className={pathname === "/dashboard" ? "block" : "hidden"}>
          <GlobalPreloader />
          <DashboardView />
        </div>
        <div className={pathname === "/calendar" ? "block" : "hidden"}>
          <CalendarView />
        </div>
        <div className={pathname === "/bookings" ? "block" : "hidden"}>
          <BookingsView />
        </div>
        <div className={pathname === "/time-tracking" ? "block" : "hidden"}>
          <TimeTrackingView />
        </div>
        {/* Add more views here as needed */}
      </div>

      {/* Non-persistent content (Actual page children for subpages like /bookings/1) */}
      <div className={!isPersistent ? "block" : "hidden"}>
        {children}
      </div>
    </div>
  );
}
