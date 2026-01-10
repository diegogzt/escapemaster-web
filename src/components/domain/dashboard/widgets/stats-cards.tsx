import { useEffect, useState } from "react";
import { DollarSign, Users, Calendar, Activity } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { dashboard } from "@/services/api";

interface StatsCardsProps extends WidgetConfigOptions {}

interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  active_customers: number;
  active_rooms: number;
  top_rooms: any[];
}

export function StatsCards({
  showTrends = true,
  columns = 4,
  visibleStats = ["revenue", "bookings", "customers", "rooms"],
}: StatsCardsProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await dashboard.getStats("month");
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-beige)] shadow-sm animate-pulse h-full">
            <div className="h-4 bg-[var(--color-background-soft)] rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-[var(--color-background-soft)] rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const allStats = [
    {
      id: "revenue",
      title: "Ingresos Totales",
      value: data ? `€${data.total_revenue?.toLocaleString()}` : "€0",
      change: showTrends ? "Últimos 30 días" : "", // TODO: Real trends
      icon: DollarSign,
      color: "text-primary",
    },
    {
      id: "bookings",
      title: "Reservas",
      value: data ? `+${data.total_bookings}` : "0",
      change: showTrends ? "Últimos 30 días" : "",
      icon: Calendar,
      color: "text-primary",
    },
    {
      id: "customers",
      title: "Clientes Activos",
      value: data ? `+${data.active_customers}` : "0",
      change: showTrends ? "Últimos 30 días" : "",
      icon: Users,
      color: "text-primary",
    },
    {
      id: "rooms",
      title: "Salas Activas",
      value: data ? `${data.active_rooms}` : "0",
      change: showTrends ? "Total" : "",
      icon: Activity,
      color: "text-primary",
    },
  ];

  const stats = allStats.filter((s) => visibleStats.includes(s.id));

  // Dynamic grid columns based on config
  const gridCols =
    {
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
          className="bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-beige)] shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between min-h-0"
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-xs font-medium text-[var(--color-muted-foreground)] truncate">
              {stat.title}
            </h3>
            <stat.icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
          </div>
          <div className="min-h-0">
            <div className="text-xl font-bold text-[var(--color-foreground)]">{stat.value}</div>
            {showTrends && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1 truncate">
                {stat.change}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
