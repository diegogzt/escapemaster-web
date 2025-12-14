import { Clock, User } from "lucide-react";
import { WidgetConfigOptions } from "../types";

interface UpcomingSessionsProps extends WidgetConfigOptions {}

export function UpcomingSessions({
  limit = 5,
  showPastSessions = false,
}: UpcomingSessionsProps) {
  const allSessions = [
    {
      id: 1,
      room: "La Cripta del Faraón",
      customer: "Ana García",
      time: "14:00 - 15:00",
      status: "Confirmada",
      statusColor: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      room: "Misión Espacial",
      customer: "Carlos Ruiz",
      time: "15:30 - 16:30",
      status: "Pendiente",
      statusColor: "bg-gray-100 text-gray-600",
    },
    {
      id: 3,
      room: "El Laboratorio Loco",
      customer: "Grupo Empresa Tech",
      time: "17:00 - 18:30",
      status: "Confirmada",
      statusColor: "bg-primary/10 text-primary",
    },
    {
      id: 4,
      room: "La Cripta del Faraón",
      customer: "Familia López",
      time: "19:00 - 20:00",
      status: "Confirmada",
      statusColor: "bg-primary/10 text-primary",
    },
    {
      id: 5,
      room: "Bunker Secreto",
      customer: "Team Building Co.",
      time: "20:30 - 22:00",
      status: "Confirmada",
      statusColor: "bg-primary/10 text-primary",
    },
  ];

  const sessions = allSessions.slice(0, limit);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">
          Próximas Sesiones
        </h3>
        <p className="text-xs text-gray-500">Sesiones programadas para hoy</p>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="mt-1 bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary/10 transition-colors flex-shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{session.room}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate">
                      <User size={12} className="flex-shrink-0" />
                      {session.customer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="flex-shrink-0" />
                      {session.time}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${session.statusColor}`}
              >
                {session.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
          Ver calendario completo
        </button>
      </div>
    </div>
  );
}
