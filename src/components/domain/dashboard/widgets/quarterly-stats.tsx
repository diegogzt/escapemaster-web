"use client";

import React from "react";
import { CalendarRange, TrendingUp, Users, DollarSign } from "lucide-react";

export function QuarterlyStatsWidget() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark">Resumen Trimestral (Q4)</h3>
        </div>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          +12.5% vs Q3
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-light rounded-lg">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-dark">45.2k €</p>
        </div>

        <div className="p-4 bg-light rounded-lg">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Jugadores</span>
          </div>
          <p className="text-2xl font-bold text-dark">1,240</p>
        </div>

        <div className="p-4 bg-light rounded-lg">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Ticket Medio</span>
          </div>
          <p className="text-2xl font-bold text-dark">85 €</p>
        </div>

        <div className="p-4 bg-light rounded-lg">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <CalendarRange className="h-4 w-4" />
            <span className="text-sm font-medium">Ocupación</span>
          </div>
          <p className="text-2xl font-bold text-dark">78%</p>
        </div>
      </div>
    </div>
  );
}
