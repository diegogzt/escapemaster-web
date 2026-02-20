import { useEffect, useState } from "react";
import { AlertTriangle, Euro } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { bookings } from "@/services/api";

interface PendingPaymentsProps extends WidgetConfigOptions {}

export function PendingPaymentsWidget({}: PendingPaymentsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookings.list({ status: "pending", page_size: 20 });
        const data = Array.isArray(response?.bookings) ? response.bookings : (Array.isArray(response) ? response : []);
        // Only show items with actual remaining balances
        const withDebt = data.filter((b: any) => Number(b.remaining_balance) > 0);
        setItems(withDebt.slice(0, 5)); // Limit to top 5
      } catch (error) {
        console.error("Failed to fetch pending payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2"><AlertTriangle size={16}/> Pagos Pendientes</h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">Reservas con deuda activa</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-10 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay deudas pendientes registradas.</div>
        ) : (
          <div className="space-y-3">
            {items.map(b => (
              <div key={b.id} className="flex justify-between items-center p-2 border border-red-100 bg-red-50/50 rounded-lg">
                <div>
                   <p className="text-sm font-medium text-[var(--color-foreground)]">{b.guest?.full_name || 'Sin nombre'}</p>
                   <p className="text-xs text-[var(--color-muted-foreground)]">{new Date(b.start_time).toLocaleDateString()}</p>
                </div>
                <div className="text-right text-red-600 font-bold flex items-center gap-1">
                   {Number(b.remaining_balance).toFixed(2)}<Euro size={12}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
