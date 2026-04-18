import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Clock } from "lucide-react";
import { widgets } from "@/services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { WidgetConfigOptions } from "../types";

export function ProjectedEarningsWidget({
  className,
}: WidgetConfigOptions & { className?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await widgets.getRevenueSummary("month");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch revenue summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map backend fields to widget expectations
  const grossRevenue = data?.total_revenue || 0;
  const total = data?.projected_revenue || grossRevenue; // Fallback to earned if no projection
  const pendingRevenue = data?.pending_revenue || (data?.expected_revenue ? data.expected_revenue - grossRevenue : 0);
  const progress = total > 0 ? (grossRevenue / total) * 100 : (grossRevenue > 0 ? 100 : 0);

  if (!data || (grossRevenue === 0 && pendingRevenue === 0)) {
    return (
      <div
        className={`bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)] shadow-sm flex flex-col h-full ${className}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Proyección Mensual</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">Sin datos disponibles</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">No hay ingresos registrados este mes</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)] shadow-sm flex flex-col h-full ${className}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)]">
            Proyección Mensual
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Ganancias estimadas vs reales
          </p>
        </div>
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-[var(--color-foreground)]">
            €{grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
            / €{total.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--color-light)] h-3 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-[var(--color-light)]/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1 text-[var(--color-muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-xs font-medium">Ya ganado</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-foreground)] block">
              €{grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-[var(--color-light)]/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1 text-[var(--color-muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-xs font-medium">Por ganar</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-foreground)] block">
              €{pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
