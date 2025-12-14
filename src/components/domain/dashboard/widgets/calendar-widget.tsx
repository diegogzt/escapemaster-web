"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils";
import { WidgetConfigOptions } from "../types";

interface CalendarWidgetProps extends WidgetConfigOptions {}

export function CalendarWidget({
  defaultView = "month",
  showWeekends = true,
}: CalendarWidgetProps) {
  const [view, setView] = useState<"month" | "week" | "day">(defaultView);
  const [date, setDate] = useState(new Date());

  // Sync with prop changes
  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

  const allDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const days = showWeekends ? allDays : allDays.slice(1, 6);
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

  // Hardcoded room data with colors
  const rooms = [
    { id: 1, name: "Sala A", color: "text-blue-500" },
    { id: 2, name: "Sala B", color: "text-green-500" },
    { id: 3, name: "Sala C", color: "text-purple-500" },
  ];

  // Helper to get random session counts for demo
  const getSessionsForDate = (d: Date) => {
    // Use date to generate deterministic random-like data
    const seed = d.getDate() + d.getMonth();
    return {
      total: (seed % 5) + 2, // 2 to 6 sessions
      byRoom: [
        (seed % 3) + 1, // Room A: 1-3
        (seed % 2) + 1, // Room B: 1-2
        seed % 4 === 0 ? 0 : 1, // Room C: 0-1
      ],
    };
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      weekDays.push(current);
    }

    return (
      <div className="grid grid-cols-7 gap-1 h-full pt-2">
        {weekDays.map((d, index) => {
          const isToday =
            d.getDate() === new Date().getDate() &&
            d.getMonth() === new Date().getMonth();
          const sessions = getSessionsForDate(d);

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase">
                {days[d.getDay()]}
              </span>
              <span
                className={cn(
                  "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  isToday
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-primary/10 hover:text-primary"
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-1 items-center">
                {sessions.byRoom.map(
                  (count, i) =>
                    count > 0 && (
                      <span
                        key={i}
                        className={cn("text-xs font-bold", rooms[i].color)}
                      >
                        {count}
                      </span>
                    )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
        {daysArray.map((d) => {
          const currentDay = new Date(year, month, d);
          const sessions = getSessionsForDate(currentDay);
          const isToday =
            d === new Date().getDate() && month === new Date().getMonth();

          return (
            <div
              key={d}
              className={cn(
                "py-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors flex flex-col items-center justify-center gap-0.5 min-h-12 group",
                isToday ? "bg-primary/5" : ""
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium group-hover:text-primary",
                  isToday ? "bg-primary text-white group-hover:text-white" : "text-gray-700"
                )}
              >
                {d}
              </span>
              {sessions.total > 0 && (
                <span className="text-[10px] font-bold text-gray-400">
                  {sessions.total} ses.
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-beige h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-dark text-sm">Calendario</h3>
        </div>
        <div className="flex gap-1 bg-light rounded-lg p-1">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "month"
                ? "bg-white shadow-sm text-dark font-medium"
                : "text-gray-500 hover:text-dark"
            )}
          >
            Mes
          </button>
          <button
            onClick={() => setView("week")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "week"
                ? "bg-white shadow-sm text-dark font-medium"
                : "text-gray-500 hover:text-dark"
            )}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <button
          onClick={() => {
            const newDate = new Date(date);
            if (view === "month") {
              newDate.setMonth(date.getMonth() - 1);
            } else {
              newDate.setDate(date.getDate() - 7);
            }
            setDate(newDate);
          }}
          className="p-1 hover:bg-beige hover:text-dark rounded-full transition-colors group"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4 text-secondary group-hover:text-dark" />
        </button>
        <span className="font-medium text-dark capitalize text-sm">
          {monthNames[date.getMonth()]} {date.getFullYear()}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(date);
            if (view === "month") {
              newDate.setMonth(date.getMonth() + 1);
            } else {
              newDate.setDate(date.getDate() + 7);
            }
            setDate(newDate);
          }}
          className="p-1 hover:bg-beige hover:text-dark rounded-full transition-colors group"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4 text-secondary group-hover:text-dark" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {view === "month" ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
}
