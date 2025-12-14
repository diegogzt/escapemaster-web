"use client";

import React from "react";
import { CalendarRange, TrendingUp, Users, DollarSign } from "lucide-react";
import { WidgetConfigOptions } from "../types";

interface QuarterlyStatsWidgetProps extends WidgetConfigOptions {}

export function QuarterlyStatsWidget({
  dateRange = "quarter",
}: QuarterlyStatsWidgetProps) {
  const getQuarterLabel = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark text-sm">Resumen {getQuarterLabel()}</h3>
        </div>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          +12.5% vs {dateRange === "year" ? "año ant." : "trim. ant."}
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 auto-rows-fr">
        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ingresos</span>
          </div>
          <p className="text-xl font-bold text-dark">45.2k €</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Jugadores</span>
          </div>
          <p className="text-xl font-bold text-dark">1,240</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ticket Medio</span>
          </div>
          <p className="text-xl font-bold text-dark">85 €</p>
        </div>

        <div className="p-3 bg-light rounded-lg flex flex-col justify-center">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <CalendarRange className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">Ocupación</span>
          </div>
          <p className="text-xl font-bold text-dark">78%</p>
        </div>
      </div>
    </div>
  );
}
