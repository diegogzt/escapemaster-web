import { Link2, PlusCircle, Settings, Users, CalendarDays, Cog, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { WidgetConfigOptions } from "../types";

interface QuickLinksProps extends WidgetConfigOptions {}

export function QuickLinksWidget({}: QuickLinksProps) {
  const router = useRouter();

  const links = [
    { title: "Nueva Reserva", icon: PlusCircle, path: "/bookings/create", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Calendario", icon: CalendarDays, path: "/calendar", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Clientes", icon: Users, path: "/users", color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Reportes", icon: Activity, path: "/reports", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Salas", icon: Settings, path: "/rooms", color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Dashboard", icon: Cog, path: "/settings", color: "text-gray-600", bg: "bg-gray-50" },
  ];

  return (
    <div className="bg-[var(--color-background)] rounded-xl border border-[var(--color-beige)] shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--color-beige)] flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Link2 size={16}/> Accesos Rápidos</h3>
      </div>
      <div className="flex-1 p-4 overflow-auto min-h-0">
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
            {links.map((v, i) => (
                <button 
                  key={i} 
                  onClick={() => router.push(v.path)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border border-transparent hover:border-beige/50 transition-all ${v.bg} hover:shadow-md hover:-translate-y-1`}
                >
                    <v.icon size={24} className={`mb-2 ${v.color}`} />
                    <span className="text-xs font-bold text-center text-gray-700">{v.title}</span>
                </button>
            ))}
         </div>
      </div>
    </div>
  );
}
