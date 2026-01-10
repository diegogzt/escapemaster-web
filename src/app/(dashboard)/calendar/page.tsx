"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/Button";
import { bookings as bookingsApi, rooms as roomsApi } from "@/services/api";

// Tipos
type ViewType = "month" | "week" | "day";

interface Session {
  id: string;
  title: string;
  customer: string;
  start: Date;
  end: Date;
  room: string;
  status: "confirmed" | "pending" | "cancelled";
  color: string;
}

// Utility to check if color is light or dark for text contrast
const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor[0] !== '#') return '#000000';
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewType>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomColorMap, setRoomColorMap] = useState<Record<string, string>>({});

  // Fetch sessions from API
  // Fetch sessions from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Calculate date range based on view
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Start of month (local time YYYY-MM-DD)
        const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        
        // End of month
        const lastDay = new Date(year, month + 1, 0);
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

        const [bookingsResponse, roomsData] = await Promise.all([
          bookingsApi.list({ 
            date_from: firstDayStr, 
            date_to: lastDayStr, 
            page_size: 1000 // Ensure we get all bookings for the month
          }),
          roomsApi.list(),
        ]);
        
        // Create room color map
        const roomsMap: Record<string, any> = {};
        const rooms = roomsData?.rooms || roomsData || [];
        (rooms).forEach((room: any) => {
          roomsMap[room.id] = room;
          // Fallback map by name if needed
          roomsMap[room.name] = room;
        });
        
        // Transform bookings to sessions
        // Handle object vs array response
        const bookingsList = bookingsResponse?.bookings || bookingsResponse || [];
        
        const transformedSessions: Session[] = bookingsList.map((b: any) => {
          const roomName = b.room_name || "Sin sala";
          const status = (b.booking_status === "cancelled" ? "cancelled" : 
                         b.booking_status === "confirmed" ? "confirmed" : "pending") as "confirmed" | "pending" | "cancelled";
          
          // Parse start_time and end_time from API (ISO format)
          const start = b.start_time ? new Date(b.start_time) : new Date();
          const end = b.end_time ? new Date(b.end_time) : new Date(start.getTime() + 90 * 60000); // Default 90 min

          // Determine color
          let color = b.room_color || "#3B82F6"; // Use backend provided room color or default
          
          // Fallback or Status override logic (if needed in future, but prioritizing room_color now)
          if (b.room_id && roomsMap[b.room_id]) {
            const room = roomsMap[b.room_id];
             // Only override if there is a SPECIFIC status color configured that overrides the base room color
             if (room.status_colors && room.status_colors[status]) {
               color = room.status_colors[status];
             }
          }
          
          return {
            id: b.id,
            title: roomName,
            customer: b.guest?.full_name || "Sin cliente",
            start,
            end,
            room: roomName,
            status,
            color,
          };
        });
        
        setSessions(transformedSessions);
        setError(null);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Error al cargar el calendario");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentDate, view]); // Re-fetch when date or view changes

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setView("week");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Utilidades de Fecha
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Domingo, 1 = Lunes. Ajustamos para que Lunes sea 0
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const addMonths = (date: Date, amount: number) => {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  };

  const addDays = (date: Date, amount: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + amount);
    return newDate;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getWeekStartMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(diff);
    return monday;
  };

  const weekStart = useMemo(
    () => getWeekStartMonday(currentDate),
    [currentDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const formatWeekRange = (start: Date, end: Date) => {
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    const startFmt = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    }).format(start);

    const endFmt = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: sameMonth ? undefined : "short",
      year: sameYear ? undefined : "numeric",
    }).format(end);

    const yearFmt = new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
    }).format(end);
    return `${startFmt} - ${endFmt} ${yearFmt}`;
  };

  const getStatusPill = (status: Session["status"]) => {
    if (status === "confirmed") {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
          Confirmada
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
          Pendiente
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
        Cancelada
      </span>
    );
  };

  // Navegación
  const handlePrev = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, -1));
    else if (view === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Renderizadores
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Padding días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 bg-gray-50 border border-gray-100"
        ></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const daySessions = sessions.filter((s) => isSameDay(s.start, date));
      const isToday = isSameDay(date, new Date());

      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-100 p-2 overflow-y-auto transition-colors hover:bg-gray-50 custom-scrollbar ${
            isToday ? "bg-blue-50/30" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                isToday ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {daySessions.length > 0 && (
              <span className="text-xs text-gray-400">
                {daySessions.length} ses.
              </span>
            )}
          </div>
          <div className="space-y-1">
            {daySessions.map((session) => (
              <div
                key={session.id}
                className="text-xs p-1 rounded truncate border shadow-sm"
                style={{ 
                  backgroundColor: session.color, 
                  borderColor: session.color,
                  color: getContrastColor(session.color)
                }}
              >
                {session.start.getHours()}:
                {session.start.getMinutes().toString().padStart(2, "0")}{" "}
                {session.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-500"
          >
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map((d) => (
            <div
              key={d.toISOString()}
              className={`p-3 text-center border-r last:border-r-0 ${
                isSameDay(d, new Date()) ? "text-primary" : "text-gray-700"
              }`}
            >
              <div className="text-xs uppercase text-gray-500">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()]}
              </div>
              <div className="text-lg font-bold">{d.getDate()}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((d) => {
            const daySessions = sessions
              .filter((s) => isSameDay(s.start, d))
              .sort((a, b) => a.start.getTime() - b.start.getTime());

            return (
              <div key={d.toISOString()} className="bg-white p-3 min-h-[220px]">
                {daySessions.length === 0 ? (
                  <div className="text-sm text-gray-400">Sin sesiones</div>
                ) : (
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className="text-xs rounded-lg border p-2 shadow-sm"
                        style={{ 
                          backgroundColor: session.color, 
                          borderColor: session.color,
                          color: getContrastColor(session.color)
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold truncate">
                            {session.title}
                          </div>
                          <div className="text-[11px] opacity-80 whitespace-nowrap">
                            {formatTime(session.start)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 opacity-90">
                          <span className="truncate">{session.customer}</span>
                          <span className="whitespace-nowrap">
                            {session.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMobileWeekList = () => {
    const sessionsByDay = weekDays.map((d) => {
      const items = sessions
        .filter((s) => isSameDay(s.start, d))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
      return { date: d, items };
    });

    return (
      <div className="space-y-4">
        {sessionsByDay.map(({ date, items }) => {
          const isToday = isSameDay(date, new Date());
          return (
            <div
              key={date.toISOString()}
              className="bg-white rounded-xl border border-beige/60 overflow-hidden"
            >
              <div
                className={`px-4 py-3 flex items-center justify-between border-b border-beige/60 ${
                  isToday ? "bg-primary/5" : "bg-light/30"
                }`}
              >
                <div className="font-bold text-dark capitalize">
                  {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {items.length} {items.length === 1 ? "sesión" : "sesiones"}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin sesiones</div>
                ) : (
                  items.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-beige/60 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-dark">
                              {formatTime(session.start)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(session.end)}
                            </div>
                          </div>
                          <div className="mt-1 font-bold text-dark truncate">
                            {session.title}
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-gray-400" />
                              <span className="truncate">
                                {session.customer}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate">{session.room}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span>
                                {formatTime(session.start)} -{" "}
                                {formatTime(session.end)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {getStatusPill(session.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const daySessions = sessions.filter((s) => isSameDay(s.start, currentDate));

    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50 text-center font-bold text-lg capitalize">
          {currentDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="p-4">
          {daySessions.length === 0 ? (
            <div className="text-sm text-gray-500">
              No hay sesiones para este día.
            </div>
          ) : (
            <div className="space-y-3">
              {daySessions
                .slice()
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl p-4 border shadow-sm"
                    style={{ 
                          backgroundColor: session.color, 
                          borderColor: session.color,
                          color: getContrastColor(session.color)
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                          <Clock size={12} />
                          <span>
                            {formatTime(session.start)} -{" "}
                            {formatTime(session.end)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1 opacity-90">
                          <Users size={12} />
                          <span className="truncate">{session.customer}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-white/50 rounded text-black">
                        <MapPin size={12} />
                        {session.room}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Mobile: Weekly list (default current week) */}
      <div className="md:hidden space-y-4">
        <div className="bg-white p-4 rounded-xl border border-beige/60 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setView("week");
                  handlePrev();
                }}
                aria-label="Semana anterior"
                className="p-2 rounded-lg border border-beige/60 bg-white text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 capitalize">
                  {formatDate(currentDate)}
                </div>
                <div className="font-bold text-dark truncate">
                  Semana actual: {formatWeekRange(weekStart, weekEnd)}
                </div>
              </div>
              <button
                onClick={() => {
                  setView("week");
                  handleNext();
                }}
                aria-label="Semana siguiente"
                className="p-2 rounded-lg border border-beige/60 bg-white text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Button onClick={() => router.push("/bookings/create")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nueva
            </Button>
          </div>
          <div className="mt-3 flex justify-between">
            <button
              onClick={() => {
                setView("week");
                handleToday();
              }}
              className="text-sm font-medium text-primary"
            >
              Hoy
            </button>
          </div>
        </div>

        <div className="flex-1">{renderMobileWeekList()}</div>
      </div>

      {/* Desktop: existing calendar views */}
      <div className="hidden md:flex flex-col space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={handlePrev}
                aria-label="Anterior"
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                Hoy
              </button>
              <button
                onClick={handleNext}
                aria-label="Siguiente"
                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {view === "month"
                ? formatDate(currentDate)
                : view === "day"
                ? currentDate.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : `Semana del ${currentDate.getDate()}`}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === "month"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === "week"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === "day"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Día
            </button>
          </div>

          <Button onClick={() => router.push("/bookings/create")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
          {view === "day" && renderDayView()}
        </div>
      </div>
    </div>
  );
}
