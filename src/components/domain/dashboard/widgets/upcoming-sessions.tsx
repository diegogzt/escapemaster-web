import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { dashboard } from "@/services/api";

interface UpcomingSessionsProps extends WidgetConfigOptions {}

interface Session {
  id: string;
  room_name: string;
  customer_name: string;
  start_time: string;
  status: string;
}

export function UpcomingSessions({
  limit = 5,
  showPastSessions = false,
}: UpcomingSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await dashboard.getSummary();
        setSessions(summary.upcoming_bookings || []);
      } catch (error) {
        console.error("Failed to fetch summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmada";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelada";
      case "completed": return "Completada";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary/10 text-primary";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-[var(--color-light)] text-[var(--color-foreground)]";
      default: return "bg-[var(--color-light)] text-[var(--color-muted-foreground)]";
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const end = new Date(date.getTime() + 60 * 60 * 1000); // Assume 1 hour
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return isoString;
    }
  };

  const items = sessions.slice(0, limit);

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          Próximas Sesiones
        </h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">Sesiones programadas</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {loading ? (
             <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-[var(--color-background-soft)] rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--color-background-soft)] rounded w-1/2"></div>
                    <div className="h-3 bg-[var(--color-background-soft)] rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8 text-sm">No hay sesiones próximas.</div>
        ) : (
        <div className="space-y-4">
          {items.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="mt-1 bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary/10 transition-colors flex-shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-[var(--color-foreground)] text-sm truncate">{session.room_name}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-[var(--color-muted-foreground)]">
                    <span className="flex items-center gap-1 truncate">
                      <User size={12} className="flex-shrink-0" />
                      {session.customer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="flex-shrink-0" />
                      {formatTime(session.start_time)}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(session.status)}`}
              >
                {getStatusLabel(session.status)}
              </span>
            </div>
          ))}
        </div>
        )}
      </div>
      <div className="p-4 border-t border-[var(--color-beige)] flex-shrink-0">
        <button className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-dashed border-[var(--color-beige)] rounded-lg hover:bg-[var(--color-light)]">
          Ver calendario completo
        </button>
      </div>
    </div>
  );
}
