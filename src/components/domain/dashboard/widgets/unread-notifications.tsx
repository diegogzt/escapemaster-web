import { useEffect, useState } from "react";
import { Bell, ShieldAlert } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { notifications } from "@/services/api";

interface UnreadNotificationsProps extends WidgetConfigOptions {}

export function UnreadNotificationsWidget({}: UnreadNotificationsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await notifications.list();
        const list = Array.isArray(response) ? response : (response?.data || []);
        const unread = list.filter((n: any) => !n.read);
        setItems(unread.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2"><Bell size={16}/> Notificaciones No Leídas</h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">Avisos del sistema</p>
        </div>
        {items.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{items.length}</span>
        )}
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-12 bg-[var(--color-background-soft)] rounded-lg"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm flex flex-col items-center">
              <ShieldAlert size={24} className="mb-2 opacity-30"/>
              Bandeja libre.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(n => (
              <div key={n.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg group">
                <p className="font-bold text-sm text-[var(--color-foreground)] mb-1 group-hover:text-primary transition-colors">{n.title}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-2 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 text-right">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
