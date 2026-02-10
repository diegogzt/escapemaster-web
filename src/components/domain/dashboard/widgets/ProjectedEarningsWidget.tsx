import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Clock } from "lucide-react";
import { widgets } from "@/services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

import { WidgetConfigOptions } from "../types";

export function ProjectedEarningsWidget({ className }: WidgetConfigOptions & { className?: string }) {
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

  if (loading) {
    return (
      <div className={`bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)] shadow-sm animate-pulse h-full ${className}`}>
        <div className="h-6 bg-[var(--color-background-soft)] rounded w-1/2 mb-6"></div>
        <div className="h-32 bg-[var(--color-background-soft)] rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: "Ganado", value: data.gross_revenue, color: "#2c5f2d" }, // Primary
    { name: "Pendiente", value: data.pending_revenue, color: "#d4a373" }, // Accent
  ];

  const total = data.projected_revenue;
  const progress = total > 0 ? (data.gross_revenue / total) * 100 : 0;

  return (
    <div className={`bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)] shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)]">Proyección Mensual</h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">Ganancias estimadas vs reales</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-[var(--color-foreground)]">
            €{(data.gross_revenue || 0).toLocaleString()}
          </span>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
            / €{(total || 0).toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--color-light)] h-3 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-[var(--color-light)]/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1 text-[var(--color-muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-xs font-medium">Ya ganado</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-foreground)] block">
              €{(data.gross_revenue || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--color-light)]/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1 text-[var(--color-muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-xs font-medium">Por ganar</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-foreground)] block">
              €{(data.pending_revenue || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
