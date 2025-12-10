import { MoreHorizontal } from "lucide-react";

export function TeamStatus() {
  const team = [
    {
      id: 1,
      name: "Laura Martínez",
      role: "Game Master",
      status: "online",
      avatar: "LM",
    },
    {
      id: 2,
      name: "David Torres",
      role: "Recepción",
      status: "busy",
      avatar: "DT",
    },
    {
      id: 3,
      name: "Elena Web",
      role: "Admin",
      status: "offline",
      avatar: "EW",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipo</h3>
          <p className="text-sm text-gray-500">Estado del personal</p>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600"
          aria-label="Opciones"
          title="Opciones"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === "online"
                        ? "bg-green-500"
                        : member.status === "busy"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {member.name}
                  </h4>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 capitalize">
                {member.status}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
          Gestionar equipo
        </button>
      </div>
    </div>
  );
}
