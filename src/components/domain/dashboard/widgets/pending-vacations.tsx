import { useEffect, useState } from "react";
import { Plane, CalendarCheck } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { vacations } from "@/services/api";

interface PendingVacationsProps extends WidgetConfigOptions {}

export function PendingVacationsWidget({}: PendingVacationsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await vacations.getAll({ status: "pending" });
        const records = Array.isArray(response) ? response : (response?.data || []);
        setItems(records.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch vacations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Plane size={16}/> Peticiones de Vacaciones</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Solicitudes pendientes de revisión</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-10 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm flex flex-col items-center">
             <CalendarCheck size={24} className="mb-2 text-green-500 opacity-50"/>
             Al día. No hay solicitudes pendientes.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(v => (
              <div key={v.id} className="p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-sm">
                <p className="font-bold text-yellow-900">{v.user?.full_name}</p>
                <div className="flex justify-between items-center mt-1 text-xs text-yellow-800">
                   <span>Inicio: {new Date(v.start_date).toLocaleDateString()}</span>
                   <span>Fin: {new Date(v.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
