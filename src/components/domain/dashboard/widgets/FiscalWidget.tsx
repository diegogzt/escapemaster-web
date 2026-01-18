import { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { reports } from "@/services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

import { WidgetConfigOptions } from "../types";

export function FiscalWidget({ className }: WidgetConfigOptions & { className?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        
        const result = await reports.getRevenue({
          start_date: startOfYear.toISOString().split('T')[0],
          end_date: endOfYear.toISOString().split('T')[0],
          group_by: 'quarter',
          type: 'actual'
        });
        
        setData(result);
      } catch (error) {
        console.error("Failed to fetch fiscal data", error);
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

  return (
    <div className={`bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-beige)] shadow-sm flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)]">Facturación Fiscal</h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">Evolución trimestral {new Date().getFullYear()}</p>
        </div>
        <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="flex-1 h-[180px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.breakdown}>
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11 }} 
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.breakdown.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.amount > 0 ? "#2c5f2d" : "#e5e7eb"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-light)]/50 flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Total Anual</span>
        <span className="text-lg font-bold text-[var(--color-foreground)]">
          €{data.total_revenue.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
