"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/services/api";

export function AppSidebar() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const { auth } = require("@/services/api");
      auth.getMemberships()
        .then((data: any) => setMemberships(Array.isArray(data) ? data : data?.memberships || data?.organizations || []))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  // Helper to check permissions
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions?.includes(permission);
  };

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
        "hidden md:flex flex-col border-r border-[var(--color-beige)]  bg-[var(--color-background)] h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center relative border-b border-[var(--color-beige)] ",
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
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-[var(--color-background)] border border-[var(--color-beige)]  rounded-full p-1 hover:bg-accent transition-colors z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Organization Switcher */}
      {!isCollapsed && isAuthenticated && (
        <div className="px-4 py-3 border-b border-[var(--color-beige)]">
          <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block px-2">
            Organización
          </label>
          <div className="relative group">
            <select
              className="w-full bg-[var(--color-light)]/30 border border-beige/50 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:bg-[var(--color-light)]/50 transition-colors"
              value={user?.organization_id || ""}
              onChange={async (e) => {
                const orgId = e.target.value;
                if (orgId && orgId !== user?.organization_id) {
                  try {
                    await auth.switchOrganization(orgId);
                    window.location.reload(); // Refresh to apply new context/permissions
                  } catch (err) {
                    toast.error("Error al cambiar de organización");
                  }
                }
              }}
            >
              {memberships.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronLeft size={12} className="-rotate-90" />
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 space-y-2 py-4 overflow-y-auto">
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
        
        {hasPermission("time_tracking") && (
          <NavItem
            href="/time-tracking"
            icon={Clock}
            label="Registro de Horas"
            isCollapsed={isCollapsed}
          />
        )}

        {hasPermission("manage_timeclock") && (
          <NavItem
            href="/hr-management"
            icon={ShieldCheck}
            label="Gestión RRHH"
            isCollapsed={isCollapsed}
          />
        )}

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
          href="/roles"
          icon={ShieldCheck}
          label="Roles"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/reports"
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
          href="/profile"
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group w-full",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 overflow-hidden">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={user?.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-sm">
                {user?.full_name?.charAt(0) || "U"}
              </span>
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
          {!isCollapsed && (
            <span className="text-sm font-medium">Salir del dashboard</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
