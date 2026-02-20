import { useEffect, useState } from "react";
import { UserCheck, Clock } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { timeclock } from "@/services/api";

interface StaffClockProps extends WidgetConfigOptions {}

export function StaffClockWidget({}: StaffClockProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await timeclock.getAll({ limit: 5 });
        const entries = Array.isArray(response) ? response : (response?.data || []);
        // Sort by check_in descending to show most recent activity
        const sorted = [...entries].sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
        setItems(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch timeclock data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><UserCheck size={16}/> Control de Asistencia</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Últimos fichajes del personal</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">Sin registros recientes de fichaje.</div>
        ) : (
          <div className="space-y-3">
            {items.map(t => (
              <div key={t.id} className="flex justify-between items-center p-2 bg-[var(--color-light)] rounded-lg text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {t.user?.full_name || 'Usuario'}
                </div>
                <div className="flex flex-col items-end text-xs">
                  <span className="text-green-600 flex items-center gap-1"><Clock size={10}/> In: {new Date(t.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {t.check_out_time && (
                    <span className="text-[var(--color-muted-foreground)] flex items-center gap-1">Out: {new Date(t.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
