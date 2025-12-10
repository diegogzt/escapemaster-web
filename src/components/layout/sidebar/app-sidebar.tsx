"use client";

import { useState } from "react";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center",
          isCollapsed ? "justify-center" : "px-6"
        )}
      >
        {!isCollapsed ? (
          <h1 className="text-2xl font-bold text-primary">Flowy</h1>
        ) : (
          <h1 className="text-xl font-bold text-primary">F</h1>
        )}
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
          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
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
