import { DollarSign, Users, Calendar, Activity } from "lucide-react";
import { WidgetConfigOptions } from "../types";

interface StatsCardsProps extends WidgetConfigOptions {}

export function StatsCards({
  showTrends = true,
  columns = 4,
  visibleStats = ["revenue", "bookings", "customers", "rooms"],
}: StatsCardsProps) {
  const allStats = [
    {
      id: "revenue",
      title: "Ingresos Totales",
      value: "€45,231.89",
      change: "+20.1% mes anterior",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      id: "bookings",
      title: "Reservas",
      value: "+2350",
      change: "+180.1% mes anterior",
      icon: Calendar,
      color: "text-primary",
    },
    {
      id: "customers",
      title: "Clientes Activos",
      value: "+12,234",
      change: "+19% mes anterior",
      icon: Users,
      color: "text-primary",
    },
    {
      id: "rooms",
      title: "Salas Activas",
      value: "5",
      change: "+2 desde ayer",
      icon: Activity,
      color: "text-primary",
    },
  ];

  const stats = allStats.filter(s => visibleStats.includes(s.id));

  // Dynamic grid columns based on config
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3 h-full`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between min-h-0"
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-medium text-gray-500 truncate">
              {stat.title}
            </h3>
            <stat.icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
          </div>
          <div className="min-h-0">
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            {showTrends && (
              <p className="text-xs text-gray-500 mt-1 truncate">{stat.change}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
