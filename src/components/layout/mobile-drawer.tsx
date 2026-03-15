"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  BarChart3,
  Settings,
  Users,
  Clock,
  ShieldCheck,
  Gamepad2,
  Tags,
  Wallet,
  Bell,
  Star,
  Bot,
  CreditCard,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/context/AuthContext";

type NavItem = { href: string; icon: LucideIcon; label: string; permission?: string };
type NavGroup = { label: string | null; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/calendar", icon: CalendarDays, label: "Calendario" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { href: "/bookings", icon: ClipboardList, label: "Reservas" },
      { href: "/chatbot", icon: Bot, label: "AI Assistant" },
      { href: "/rooms", icon: DoorOpen, label: "Salas" },
      { href: "/gamemaster", icon: Gamepad2, label: "Game Master", permission: "view_schedule" },
      { href: "/reviews", icon: Star, label: "Reseñas" },
    ],
  },
  {
    label: "Personal y Usuarios",
    items: [
      { href: "/time-tracking", icon: Clock, label: "Registro de Horas", permission: "time_tracking" },
      { href: "/hr-management", icon: ShieldCheck, label: "Gestión RRHH", permission: "manage_timeclock" },
      { href: "/users", icon: Users, label: "Usuarios" },
      { href: "/roles", icon: ShieldCheck, label: "Roles" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/coupons", icon: Tags, label: "Cupones", permission: "manage_bookings" },
      { href: "/payments", icon: CreditCard, label: "Pagos", permission: "view_stats" },
      { href: "/payouts", icon: Wallet, label: "Liquidaciones", permission: "view_reports" },
      { href: "/reports", icon: BarChart3, label: "Reportes" },
      { href: "/notifications", icon: Bell, label: "Notificaciones" },
      { href: "/settings", icon: Settings, label: "Configuración" },
    ],
  },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user } = useAuth();

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions?.includes(permission);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            data-testid="mobile-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-72 bg-[var(--color-background)] border-r border-[var(--color-beige)] z-50 flex flex-col md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-beige)] shrink-0">
              <span className="font-bold text-lg text-primary">EscapeMaster</span>
              <button
                aria-label="Cerrar menú"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-4">
              {navGroups.map((group, gi) => (
                <div key={gi} className="space-y-1">
                  {group.label && (
                    <p className="px-3 py-1 text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    if (!hasPermission(item.permission)) return null;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-[var(--color-foreground)] hover:bg-accent"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* User section */}
            <div className="border-t border-[var(--color-beige)] p-3 space-y-1 shrink-0">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 overflow-hidden">
                  {user?.photo_url ? (
                    <img src={user.photo_url} alt={user?.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs">{user?.full_name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user?.full_name || "Usuario"}</span>
                  <span className="text-xs text-[var(--color-muted-foreground)] truncate">Configurar cuenta</span>
                </div>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-[var(--color-muted-foreground)] hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Salir del dashboard</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
