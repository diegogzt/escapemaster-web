import { useEffect, useState } from "react";
import { TicketPercent } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { coupons } from "@/services/api";

interface ActiveCouponsProps extends WidgetConfigOptions {}

export function ActiveCouponsWidget({}: ActiveCouponsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await coupons.list({ is_active: true });
        const list = Array.isArray(response) ? response : (response?.data || response?.coupons || []);
        // Sort by times used descending
        const sorted = [...list].sort((a, b) => (b.times_used || 0) - (a.times_used || 0));
        setItems(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch active coupons", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><TicketPercent size={16}/> Cupones Populares</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Campañas activas con más usos</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay campañas o cupones activos.</div>
        ) : (
          <div className="space-y-2">
            {items.map(c => (
              <div key={c.id} className="flex justify-between items-center p-2 pb-3 border-b border-dashed border-beige last:border-0 hover:bg-primary/5">
                <div>
                   <p className="font-mono font-bold text-primary tracking-widest text-[13px]">{c.code}</p>
                   <p className="text-xs text-[var(--color-muted-foreground)]">{c.discount_type === 'percentage' ? `${c.discount_value}% DCTO` : `${c.discount_value}€ DCTO`}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold">{c.times_used || 0} usos</p>
                   {c.max_uses && <p className="text-[10px] opacity-60">de {c.max_uses} max.</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
