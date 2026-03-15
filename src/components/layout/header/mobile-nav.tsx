"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function MobileNav() {
  const { toggleMobileMenu } = useUIStore();

  return (
    <header
      data-testid="mobile-header"
      className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--color-beige)] bg-[var(--color-background)] sticky top-0 z-40"
    >
      <button
        data-testid="hamburger-button"
        aria-label="Abrir menú"
        onClick={toggleMobileMenu}
        className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Menu size={22} />
      </button>
      <div className="font-bold text-lg text-primary">EscapeMaster</div>
      <div className="w-8" aria-hidden="true" />
    </header>
  );
}
