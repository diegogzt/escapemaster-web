"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils";
import { WidgetConfigOptions } from "../types";
import { rooms as roomsApi, bookings as bookingsApi } from "@/services/api";

// Color palette for rooms
const ROOM_COLORS = [
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
  "text-pink-500",
  "text-orange-500",
  "text-teal-500",
];

interface Room {
  id: string;
  name: string;
  color: string;
}

interface Booking {
  id: string;
  date: string;
  room_id?: string;
  room_name?: string;
}

interface CalendarWidgetProps extends WidgetConfigOptions {}

export function CalendarWidget({
  defaultView = "month",
  showWeekends = true,
}: CalendarWidgetProps) {
  const [view, setView] = useState<"month" | "week" | "day">(defaultView);
  const [date, setDate] = useState(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rooms and bookings from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [roomsRes, bookingsRes] = await Promise.all([
          roomsApi.list(),
          bookingsApi.list(),
        ]);
        
        // Extract arrays from paginated responses
        const roomsData = Array.isArray(roomsRes) ? roomsRes : roomsRes?.rooms || [];
        const bookingsData = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.bookings || [];
        
        // Transform rooms with colors
        const transformedRooms: Room[] = roomsData.map((r: any, index: number) => ({
          id: r.id,
          name: r.name,
          color: ROOM_COLORS[index % ROOM_COLORS.length],
        }));
        setRooms(transformedRooms);
        
        // Transform bookings
        // API returns: id, start_time, room_name, room_id
        const transformedBookings: Booking[] = bookingsData.map((b: any) => {
          const startTime = b.start_time ? new Date(b.start_time) : null;
          return {
            id: b.id,
            date: startTime ? startTime.toISOString().split("T")[0] : "",
            room_id: b.room_id,
            room_name: b.room_name,
          };
        });
        setBookings(transformedBookings);
      } catch (err) {
        console.error("Error fetching calendar widget data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  // Helper to get session counts for a date from real data
  const getSessionsForDate = (d: Date) => {
    const dateStr = d.toISOString().split("T")[0];
    const dayBookings = bookings.filter(b => b.date === dateStr);
    
    // Count bookings by room
    const byRoom = rooms.map(room => 
      dayBookings.filter(b => b.room_id === room.id || b.room_name === room.name).length
    );
    
    return {
      total: dayBookings.length,
      byRoom,
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
              <span className="text-xs text-[var(--color-muted-foreground)] font-medium uppercase">
                {days[d.getDay()]}
              </span>
              <span
                className={cn(
                  "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  isToday
                    ? "bg-primary text-white"
                    : "text-[var(--color-foreground)] hover:bg-primary/10 hover:text-primary"
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
          <div key={d} className="font-semibold text-[var(--color-muted-foreground)] py-1">
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
                  isToday ? "bg-primary text-white group-hover:text-white" : "text-[var(--color-foreground)]"
                )}
              >
                {d}
              </span>
              {sessions.total > 0 && (
                <span className="text-[10px] font-bold text-[var(--color-muted-foreground)]">
                  {sessions.total} ses.
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-[var(--color-foreground)] text-sm">Calendario</h3>
        </div>
        <div className="flex gap-1 bg-[var(--color-light)] rounded-lg p-1">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "month"
                ? "bg-[var(--color-background)] shadow-sm text-[var(--color-foreground)] font-medium"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            )}
          >
            Mes
          </button>
          <button
            onClick={() => setView("week")}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              view === "week"
                ? "bg-[var(--color-background)] shadow-sm text-[var(--color-foreground)] font-medium"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
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
          className="p-1 hover:bg-beige hover:text-[var(--color-foreground)] rounded-full transition-colors group"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4 text-secondary group-hover:text-[var(--color-foreground)]" />
        </button>
        <span className="font-medium text-[var(--color-foreground)] capitalize text-sm">
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
          className="p-1 hover:bg-beige hover:text-[var(--color-foreground)] rounded-full transition-colors group"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4 text-secondary group-hover:text-[var(--color-foreground)]" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {view === "month" ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
}
