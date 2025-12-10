"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bookings } from "@/services/api";

type ViewType = "day" | "week" | "month";

export default function CalendarView() {
  const [view, setView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    bookings.list()
      .then(setEvents)
      .catch((err) => {
        console.error("Failed to load bookings:", err);
        // Set empty array on error to prevent breaking the UI
        setEvents([]);
      });
  }, []);

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const next = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const prev = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    else if (view === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-beige p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-dark capitalize">
            {view === "day"
              ? currentDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : monthName}
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={prev}
              className="p-2 hover:bg-light rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="p-2 hover:bg-light rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex bg-light p-1 rounded-lg">
          {(["day", "week", "month"] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium capitalize transition-all",
                view === v
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-dark"
              )}
            >
              {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {view === "month" && <MonthView date={currentDate} events={events} />}
        {view === "week" && <WeekView date={currentDate} events={events} />}
        {view === "day" && <DayView date={currentDate} events={events} />}
      </div>
    </div>
  );
}

function MonthView({ date, events }: { date: Date; events: any[] }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50/30"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDayDate = new Date(year, month, day);
    const dayEvents = events.filter(
      (e) => new Date(e.start_time).toDateString() === currentDayDate.toDateString()
    );

    days.push(
      <div
        key={day}
        className="min-h-[120px] border-t border-l border-beige p-2 hover:bg-light/30 transition-colors relative group"
      >
        <span
          className={cn(
            "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full",
            new Date().toDateString() === currentDayDate.toDateString()
              ? "bg-primary text-white"
              : "text-gray-700"
          )}
        >
          {day}
        </span>
        <div className="mt-2 space-y-1">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className="text-xs px-2 py-1 rounded bg-[var(--color-primary)] text-white truncate opacity-90 hover:opacity-100 cursor-pointer"
            >
              {new Date(event.start_time).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {event.room?.name || "Reserva"}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-r border-b border-beige rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-light border-b border-beige">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div
            key={d}
            className="py-3 text-center text-sm font-bold text-gray-600"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">{days}</div>
    </div>
  );
}

function WeekView({ date, events }: { date: Date; events: any[] }) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // Start on Sunday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 10); // 10:00 to 22:00

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 border-b border-beige">
          <div className="p-4 text-center text-gray-500 font-medium">Hora</div>
          {weekDays.map((d) => (
            <div key={d.toISOString()} className="p-4 text-center border-l border-beige">
              <div className="text-sm font-bold text-gray-700">
                {d.toLocaleDateString("es-ES", { weekday: "short" })}
              </div>
              <div className="text-xs text-gray-500">{d.getDate()}</div>
            </div>
          ))}
        </div>
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-beige min-h-[60px]">
            <div className="p-2 text-center text-xs text-gray-500 border-r border-beige">
              {hour}:00
            </div>
            {weekDays.map((d) => {
              const dayEvents = events.filter((e) => {
                const eventDate = new Date(e.start_time);
                return (
                  eventDate.toDateString() === d.toDateString() &&
                  eventDate.getHours() === hour
                );
              });

              return (
                <div key={d.toISOString()} className="border-l border-beige p-1 relative">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="absolute inset-1 bg-primary/90 text-white text-xs p-1 rounded overflow-hidden"
                    >
                      {event.room?.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ date, events }: { date: Date; events: any[] }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 10); // 10:00 to 22:00
  const dayEvents = events.filter(
    (e) => new Date(e.start_time).toDateString() === date.toDateString()
  );

  return (
    <div className="max-w-3xl mx-auto border border-beige rounded-lg overflow-hidden">
      {hours.map((hour) => {
        const hourEvents = dayEvents.filter(
          (e) => new Date(e.start_time).getHours() === hour
        );
        return (
          <div key={hour} className="flex border-b border-beige min-h-[80px]">
            <div className="w-20 p-4 text-right text-sm text-gray-500 border-r border-beige bg-light/30">
              {hour}:00
            </div>
            <div className="flex-1 p-2 relative">
              {hourEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-primary text-white p-2 rounded shadow-sm text-sm mb-1"
                >
                  <span className="font-bold">{event.room?.name}</span> -{" "}
                  {event.customer_name} ({event.players} pax)
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
