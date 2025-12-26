"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    { href: "/calendar", icon: CalendarDays, label: "Cal" },
    { href: "/bookings", icon: ClipboardList, label: "Reservas" },
    { href: "/rooms", icon: DoorOpen, label: "Salas" },
    { href: "/reports", icon: BarChart3, label: "Reportes" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {/* More Menu / Settings could go here if needed, or just keep it simple */}
      </nav>
    </div>
  );
}
