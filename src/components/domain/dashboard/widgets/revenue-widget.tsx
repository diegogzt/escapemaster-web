import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";

export function RevenueWidget() {
  return (
    <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-[var(--color-foreground)]">Ingresos</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <TrendingUp size={12} />
          +12.5%
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-[var(--color-muted-foreground)]">Total este mes</p>
        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">€8,450.00</h2>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-beige)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-muted-foreground)]">Meta mensual</span>
          <span className="font-medium text-[var(--color-foreground)]">€10,000</span>
        </div>
        <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: "84.5%" }}
          />
        </div>
      </div>
    </div>
  );
}
