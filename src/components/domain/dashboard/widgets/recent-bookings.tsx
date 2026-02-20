import { useEffect, useState } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { bookings } from "@/services/api";

interface RecentBookingsProps extends WidgetConfigOptions {
  limit?: number;
}

export function RecentBookingsWidget({ limit = 5 }: RecentBookingsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookings.list({ page_size: limit });
        const data = Array.isArray(response?.bookings) ? response.bookings : (Array.isArray(response) ? response : []);
        setItems(data.slice(0, limit));
      } catch (error) {
        console.error("Failed to fetch recent bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit]);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Reservas Recientes</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Últimas reservas recibidas</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-[var(--color-background-soft)] rounded-lg"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay reservas recientes.</div>
        ) : (
          <div className="space-y-3">
            {items.map(b => (
              <div key={b.id} className="flex justify-between items-center p-2 hover:bg-primary/5 rounded-lg transition-colors">
                <div>
                   <p className="text-sm font-medium text-[var(--color-foreground)]">{b.room_name || (b.room ? b.room.name : 'Sin sala')}</p>
                   <p className="text-xs text-[var(--color-muted-foreground)]">{b.guest?.full_name}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold">{new Date(b.created_at || b.start_time).toLocaleDateString()}</p>
                   <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{b.booking_status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
