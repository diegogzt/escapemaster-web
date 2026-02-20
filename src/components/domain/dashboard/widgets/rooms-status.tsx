import { useEffect, useState } from "react";
import { DoorOpen, Users } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { rooms } from "@/services/api";

interface RoomsStatusProps extends WidgetConfigOptions {}

export function RoomsStatusWidget({}: RoomsStatusProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await rooms.list();
        const list = Array.isArray(response?.rooms) ? response.rooms : (Array.isArray(response) ? response : []);
        setItems(list.filter((r: any) => r.is_active));
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><DoorOpen size={16}/> Salas Activas</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Resumen de capacidad y tarifas</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay salas activas configuradas.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(r => (
              <div key={r.id} className="p-3 bg-[var(--color-light)] border border-beige rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 opacity-20 group-hover:scale-150 transition-transform origin-top-right rounded-bl-full" style={{ backgroundColor: r.color || '#3B82F6' }}></div>
                <p className="font-bold text-sm truncate z-10 relative">{r.name}</p>
                <div className="flex items-center justify-between mt-2 z-10 relative text-xs">
                   <span className="flex items-center gap-1 text-[var(--color-muted-foreground)]"><Users size={12}/> {r.capacity_min}-{r.capacity}</span>
                   <span className="font-bold">{r.price_per_person}€/pax</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
