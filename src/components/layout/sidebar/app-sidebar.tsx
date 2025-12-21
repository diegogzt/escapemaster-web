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
  Users,
  LogOut,
} from "lucide-react";
import Link from "next/link";

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
          href="/users"
          icon={Users}
          label="Usuarios"
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

      <div className="border-t p-3 space-y-1">
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group w-full",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 overflow-hidden">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={user?.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-sm">{user?.full_name?.charAt(0) || "U"}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-sm font-medium truncate text-foreground group-hover:text-primary">
                {user?.full_name || "Usuario"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Configurar cuenta
              </span>
            </div>
          )}
        </Link>

        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors w-full",
            isCollapsed && "justify-center"
          )}
          title="Salir del dashboard"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Salir del dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
