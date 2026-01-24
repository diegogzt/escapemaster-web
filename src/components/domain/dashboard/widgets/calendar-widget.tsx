"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
} from "lucide-react";
import { cn } from "@/utils";
import { WidgetConfigOptions } from "../types";
import { rooms as roomsApi, dashboard as dashboardApi } from "@/services/api";
import { useDashboardStore } from "@/store/useDashboardStore";
import BlockHoursModal from "./BlockHoursModal";

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
  duration_minutes: number;
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
  const [loading, setLoading] = useState(true);

  // Block Mode State
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | null>(null);

  const { fetchBookings } = useDashboardStore();
  const [dayStatuses, setDayStatuses] = useState<Record<string, { status: string; count: number }>>({});

  // Fetch rooms for the modal
  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await roomsApi.list();
        setRooms(data?.rooms || data || []);
      } catch (error) {
        console.error("Error fetching rooms", error);
      }
    }
    fetchRooms();
  }, []);

  // Fetch calendar status when date (month/year) changes
  useEffect(() => {
    fetchStatus();
  }, [date.getMonth(), date.getFullYear()]); 

  async function fetchStatus() {
    try {
      setLoading(true);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Fetch status directly from optimized endpoint
      const statuses = await dashboardApi.getCalendarStatus(month, year);
      setDayStatuses(statuses);
      
    } catch (err) {
      console.error("Error fetching calendar status:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDayClick = (d: number, m: number, y: number) => {
    console.log("Day clicked:", d, m, y, "Block Mode:", isBlockMode);
    if (isBlockMode) {
      setSelectedBlockDate(new Date(y, m, d));
      setShowBlockModal(true);
    }
  };

  const handleBlockSave = async (data: any) => {
    await dashboardApi.blockHours(data);
    // Refresh calendar
    await fetchStatus();
  };

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderWeekView = () => {
    return (
       <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
           Vista semanal simplificada
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
          // Construct date key YYYY-MM-DD
          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          
          const statusData = dayStatuses[dStr] || { status: 'empty', count: 0 };
          const dayStatus = statusData.status;

          const isToday =
            d === new Date().getDate() && month === new Date().getMonth();

          let statusColor = "";

          if (dayStatus === "full") {
            statusColor = "bg-red-200 text-red-800 border-red-300 hover:bg-red-300";
          } else if (dayStatus === "has_sessions") {
            statusColor = "bg-green-200 text-green-800 border-green-300 hover:bg-green-300";
          } else if (dayStatus === "closed") {
             statusColor = "bg-gray-200 text-gray-500 border-gray-300 opacity-60"; 
          }

          const baseClasses = "py-2 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-0.5 min-h-12 group border relative";
          
          return (
            <div
              key={d}
              onClick={() => handleDayClick(d, month, year)}
              className={cn(
                baseClasses,
                statusColor || "hover:bg-primary/5 border-transparent",
                isToday ? "bg-primary/5 border-primary/20" : "",
                isBlockMode ? "hover:ring-2 hover:ring-red-400 cursor-crosshair" : ""
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium",
                  isToday ? "bg-primary text-white" : "text-[var(--color-foreground)]"
                )}
              >
                {d}
              </span>
              {statusData.count > 0 && (
                 <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] opacity-75">
                    {statusData.count}
                 </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderLegend = () => (
    <div className="flex items-center gap-4 mt-4 px-2 text-xs text-secondary justify-center border-t border-[var(--color-beige)] pt-3">
        <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-200 block"></span>
            <span>Sesiones</span>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200 block"></span>
            <span>Lleno</span>
        </div>
        <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full border border-[var(--color-primary)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></div>
             </div>
             <span>Hoy</span>
        </div>
        {isBlockMode && (
          <div className="flex items-center gap-1.5 text-red-500 font-bold animate-pulse ml-2">
            <Lock size={12} />
            MODE BLOQUEO ACTIVADO
          </div>
        )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] p-4 rounded-xl shadow-sm border border-[var(--color-beige)] h-full min-h-[420px] flex flex-col overflow-hidden relative">
       {/* Block Mode Overlay/Indicator */}
      {isBlockMode && (
         <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 z-10 animate-pulse" />
      )}

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-[var(--color-foreground)] text-sm">Calendario</h3>
        </div>
        
        <div className="flex gap-2">
             <button
                onClick={() => setIsBlockMode(!isBlockMode)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-all border flex items-center gap-1 font-medium",
                  isBlockMode
                    ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                )}
                title="Cerrar horas o días"
              >
                <Lock size={12} />
                {isBlockMode ? "Cancel" : "Cerrar Horas"}
              </button>
        
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
      
      {renderLegend()}
      
      <BlockHoursModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        selectedDate={selectedBlockDate}
        rooms={rooms}
        onSave={handleBlockSave}
      />
    </div>
  );
}
