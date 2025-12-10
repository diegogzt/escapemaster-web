"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils";

export function CalendarWidget() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [date, setDate] = useState(new Date());

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonthView = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((d) => (
          <div key={d} className="font-semibold text-gray-500 py-1">
            {d}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="py-2"></div>
        ))}
        {daysArray.map((d) => (
          <div
            key={d}
            className={cn(
              "py-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors",
              d === new Date().getDate() && month === new Date().getMonth()
                ? "bg-primary text-white hover:bg-primary/90"
                : ""
            )}
          >
            {d}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-beige h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark">Calendario</h3>
        </div>
        <div className="flex gap-1 bg-light rounded-lg p-1">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "month"
                ? "bg-white shadow-sm text-dark"
                : "text-secondary hover:text-dark"
            )}
          >
            Mes
          </button>
          <button
            onClick={() => setView("week")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "week"
                ? "bg-white shadow-sm text-dark"
                : "text-secondary hover:text-dark"
            )}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}
          className="p-1 hover:bg-light rounded-full"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        <span className="font-medium text-dark">
          {monthNames[date.getMonth()]} {date.getFullYear()}
        </span>
        <button
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}
          className="p-1 hover:bg-light rounded-full"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {view === "month" ? (
        renderMonthView()
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          Vista de {view === "week" ? "semana" : "día"} en construcción
        </div>
      )}
    </div>
  );
}
