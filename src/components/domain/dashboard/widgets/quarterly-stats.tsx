"use client";

import React, { useEffect, useState } from "react";
import { CalendarRange, TrendingUp, Users, DollarSign } from "lucide-react";
import { WidgetConfigOptions } from "../types";
import { dashboard } from "@/services/api";

interface QuarterlyStatsWidgetProps extends WidgetConfigOptions {}

interface StatsData {
  total_revenue: number;
  total_bookings: number;
  avg_players_per_booking: number;
  occupancy_rate: number;
}

export function QuarterlyStatsWidget({
  dateRange = "quarter",
}: QuarterlyStatsWidgetProps) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stats = await dashboard.getStats(dateRange as string);
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch quarterly stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const getQuarterLabel = () => {
    if (dateRange === "year") return "Año Actual";
    if (dateRange === "month") return "Mes Actual";
    
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-lg h-full"></div>)}
        </div>
      </div>
    );
  }

  const revenue = data ? data.total_revenue : 0;
  const bookings = data ? data.total_bookings : 0;
  const avgPlayers = data ? data.avg_players_per_booking : 0;
  const totalPlayers = Math.round(bookings * avgPlayers);
  const ticketMedio = bookings > 0 ? revenue / bookings : 0;
  const occupancy = data ? data.occupancy_rate : 0;

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k €`;
    return `${val.toFixed(0)} €`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark text-sm">Resumen {getQuarterLabel()}</h3>
        </div>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
           Vs. periodo anterior
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 auto-rows-fr">
        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ingresos</span>
          </div>
          <p className="text-xl font-bold text-dark">{formatCurrency(revenue)}</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Jugadores</span>
          </div>
          <p className="text-xl font-bold text-dark">{totalPlayers.toLocaleString()}</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ticket Medio</span>
          </div>
          <p className="text-xl font-bold text-dark">{ticketMedio.toFixed(0)} €</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <CalendarRange className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ocupación</span>
          </div>
          <p className="text-xl font-bold text-dark">{occupancy}%</p>
        </div>
      </div>
    </div>
  );
}
