import { DollarSign, Users, Calendar, Activity } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      title: "Ingresos Totales",
      value: "€45,231.89",
      change: "+20.1% mes anterior",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Reservas",
      value: "+2350",
      change: "+180.1% mes anterior",
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Clientes Activos",
      value: "+12,234",
      change: "+19% mes anterior",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Salas Activas",
      value: "5",
      change: "+2 desde ayer",
      icon: Activity,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              {stat.title}
            </h3>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
