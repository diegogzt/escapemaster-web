import { Clock, MapPin, User } from "lucide-react";

export function UpcomingSessions() {
  const sessions = [
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
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Próximas Sesiones
        </h3>
        <p className="text-sm text-gray-500">Sesiones programadas para hoy</p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between group"
            >
              <div className="flex gap-4">
                <div className="mt-1 bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{session.room}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {session.customer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {session.time}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${session.statusColor}`}
              >
                {session.status}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
          Ver calendario completo
        </button>
      </div>
    </div>
  );
}
