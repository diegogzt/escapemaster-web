import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { dashboard } from "@/services/api";

interface RevenueWidgetProps extends WidgetConfigOptions {
  title?: string;
  defaultPeriod?: "month" | "year" | "week" | "quarter";
  targetMonthly?: number;
}

export function RevenueWidget({ 
  title = "Ingresos", 
  defaultPeriod = "month",
  targetMonthly = 10000 
}: RevenueWidgetProps) {
  const [data, setData] = useState<{ total: number; change: string; progress: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("DEBUG: Se ha cargado el widget Ingresos");
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboard.getRevenue(defaultPeriod);
        if (response) {
          const total = response.total || 0;
          const progress = Math.min(100, (total / targetMonthly) * 100);
          setData({
            total,
            change: "+12.5%", // TODO: Calulate real change
            progress
          });
        }
      } catch (error) {
        console.error("Failed to fetch revenue widget data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [defaultPeriod, targetMonthly]);

  if (loading) {
    return (
      <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
      </div>
    );
  }

  const currentData = data || { total: 8450, change: "+12.5%", progress: 84.5 };

  return (
    <div className="bg-[var(--color-background)] p-6 rounded-xl shadow-sm border border-[var(--color-beige)] h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-[var(--color-foreground)]">{title}</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <TrendingUp size={12} />
          {currentData.change}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Total este {defaultPeriod === "month" ? "mes" : defaultPeriod === "year" ? "año" : "semana"}
        </p>
        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">
          €{(currentData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-beige)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-muted-foreground)]">Meta {defaultPeriod === "month" ? "mensual" : defaultPeriod === "year" ? "anual" : "semanal"}</span>
          <span className="font-medium text-[var(--color-foreground)]">€{(targetMonthly || 0).toLocaleString()}</span>
        </div>
        <div className="mt-2 h-2 w-full bg-[var(--color-light)] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${currentData.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
