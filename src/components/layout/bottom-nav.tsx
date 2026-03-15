"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function BottomNav() {
  const pathname = usePathname();
  const { toggleMobileMenu, isMobileMenuOpen } = useUIStore();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    { href: "/calendar", icon: CalendarDays, label: "Cal" },
    { href: "/bookings", icon: ClipboardList, label: "Reservas" },
    { href: "/rooms", icon: DoorOpen, label: "Salas" },
  ];

  return (
    <div
      data-testid="bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-[var(--color-beige)] z-50 pb-safe"
    >
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive
                  ? "text-primary"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] dark:hover:text-white"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* "Más" button — opens the full nav drawer */}
        <button
          data-testid="more-button"
          aria-label="Más opciones"
          onClick={toggleMobileMenu}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1",
            isMobileMenuOpen
              ? "text-primary"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] dark:hover:text-white"
          )}
        >
          <MoreHorizontal size={20} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </nav>
    </div>
  );
}
