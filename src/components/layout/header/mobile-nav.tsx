"use client";

import { Menu } from "lucide-react";

export function MobileNav() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 border-b bg-background sticky top-0 z-50">
      <div className="font-bold text-lg">Flowy</div>
      <button className="p-2" aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}
