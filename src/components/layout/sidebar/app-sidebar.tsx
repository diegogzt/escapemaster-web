"use client";

import { useState, useEffect } from "react";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function AppSidebar() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage first
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.preferences?.sidebarCollapsed !== undefined &&
      isInitialized
    ) {
      if (user.preferences.sidebarCollapsed !== isCollapsed) {
        setIsCollapsed(user.preferences.sidebarCollapsed);
      }
    }
  }, [isAuthenticated, user?.preferences?.sidebarCollapsed, isInitialized]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));

    if (isAuthenticated && isInitialized) {
      const newPreferences = {
        ...(user?.preferences || {}),
        sidebarCollapsed: newState,
      };
      updateUser({ preferences: newPreferences }).catch(console.error);
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center relative",
          isCollapsed ? "justify-center" : "px-6"
        )}
      >
        {!isCollapsed ? (
          <h1 className="text-xl font-bold text-primary">EscapeMaster</h1>
        ) : (
          <h1 className="text-xl font-bold text-primary">EM</h1>
        )}

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-background border rounded-full p-1 hover:bg-accent transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-2 py-4">
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/calendar"
          icon={CalendarDays}
          label="Calendario"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/bookings"
          icon={ClipboardList}
          label="Reservas"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/rooms"
          icon={DoorOpen}
          label="Salas"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/reports/revenue"
          icon={BarChart3}
          label="Reportes"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/settings"
          icon={Settings}
          label="Configuración"
          isCollapsed={isCollapsed}
        />
      </nav>

      <div
        className={cn(
          "p-4 border-t flex",
          isCollapsed ? "justify-center" : "justify-end"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
