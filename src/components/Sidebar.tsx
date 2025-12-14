"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Layers,
  Clock,
  Tag,
  Settings,
  FileText,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/users", icon: Users, label: "Usuarios" },
    { href: "/dashboard/rooms", icon: Layers, label: "Salas" },
    { href: "/dashboard/schedules", icon: Clock, label: "Horarios" },
    { href: "/dashboard/coupons", icon: Tag, label: "Cupones" },
    { href: "/settings", icon: Settings, label: "Configuración" },
    { href: "/docs", icon: FileText, label: "Documentación" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-beige flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-beige">
        <h1 className="text-xl font-bold text-primary">EscapeMaster</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">{menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-primary text-white"
                : "text-secondary hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-beige space-y-2">
        <button
          onClick={() => setTheme(theme === "tropical" ? "twilight" : "tropical")}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary hover:bg-primary/10 hover:text-primary w-full transition-colors"
        >
          {theme === "tropical" ? <Moon size={20} /> : <Sun size={20} />}
          <span className="font-medium">
            {theme === "tropical" ? "Modo Oscuro" : "Modo Claro"}
          </span>
        </button>

        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
