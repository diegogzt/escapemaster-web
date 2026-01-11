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
  Plus,
} from "lucide-react";
import Button from "@/components/Button";
import { bookings as bookingsApi, rooms as roomsApi } from "@/services/api";
import { useDataStore } from "@/stores/data-store";

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

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor[0] !== '#') return '#000000';
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};

export function CalendarView() {
  const router = useRouter();
  const { calendarState, setCalendarState, fetchRooms } = useDataStore();
  
  const view = calendarState.view;
  const currentDate = new Date(calendarState.currentDate);
  const sessions = calendarState.sessions.map(s => ({ ...s, start: new Date(s.start), end: new Date(s.end) }));
  
  const [loading, setLoading] = useState(!calendarState.lastFetched);
  const [error, setError] = useState<string | null>(null);

  const setView = (v: ViewType) => setCalendarState({ view: v });
  const setCurrentDate = (d: Date) => setCalendarState({ currentDate: d.toISOString() });
  const setSessions = (s: Session[]) => setCalendarState({ sessions: s, lastFetched: Date.now() });

  useEffect(() => {
    async function fetchData() {
      const isFresh = calendarState.lastFetched && (Date.now() - calendarState.lastFetched < 60000);
      if (isFresh && sessions.length > 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0);
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

        const [bookingsResponse, roomsData] = await Promise.all([
          bookingsApi.list({ date_from: firstDayStr, date_to: lastDayStr, page_size: 1000 }),
          roomsApi.list(),
        ]).catch(err => {
          console.error("Promise.all failed:", err);
          throw err;
        });
        
        const roomsMap: Record<string, any> = {};
        const roomsResult = roomsData?.rooms || (Array.isArray(roomsData) ? roomsData : []);
        roomsResult.forEach((room: any) => { roomsMap[room.id] = room; });
        
        const bookingsList = bookingsResponse?.bookings || (Array.isArray(bookingsResponse) ? bookingsResponse : []);
        
        if (!Array.isArray(bookingsList)) {
          console.error("bookingsList is not an array:", bookingsList);
          throw new Error("Respuesta de API inválida");
        }

        const transformedSessions: Session[] = bookingsList.map((b: any) => {
          const roomName = b.room_name || "Sin sala";
          const status = (b.booking_status || "pending") as any;
          const start = new Date(b.start_time);
          const end = b.end_time ? new Date(b.end_time) : new Date(start.getTime() + 90 * 60000);
          let color = b.room_color || "#3B82F6";
          if (b.room_id && roomsMap[b.room_id]?.status_colors?.[status]) color = roomsMap[b.room_id].status_colors[status];
          
          return { id: b.id, title: roomName, customer: b.guest?.full_name || "Sin cliente", start, end, room: roomName, status, color };
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
  }, [calendarState.currentDate, calendarState.view]);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  // Month grid logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for 1st of month (0-6, where 0 is Sunday)
    // Adjust to Monday = 0
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;
    
    const days = [];
    
    // Previous month filler
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true });
    }
    
    // Next month filler
    const remainingSlots = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingSlots; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false });
    }
    
    return days;
  }, [currentDate]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  if (loading && !sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-beige/50">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-medium">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--color-background)] p-4 md:px-6 md:py-4 rounded-3xl border border-beige shadow-sm gap-4">
        <div className="flex items-center gap-5">
          <div className="flex bg-[var(--color-light)]/50 rounded-2xl p-1.5 border border-beige/30">
            <button onClick={handlePrev} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-sm font-bold text-primary hover:bg-white rounded-xl transition-all">Hoy</button>
            <button onClick={handleNext} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-2xl font-black text-primary capitalize tracking-tight">
            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-[var(--color-light)]/50 rounded-2xl p-1.5 border border-beige/30 flex-1 md:flex-initial">
              {["month", "week", "day"].map(v => (
                  <button 
                    key={v} 
                    onClick={() => setView(v as any)} 
                    className={`flex-1 md:px-6 py-2 text-sm font-bold rounded-xl transition-all capitalize ${view === v ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-white"}`}
                  >
                    {v === "month" ? "Mes" : v === "week" ? "Semana" : "Día"}
                  </button>
              ))}
          </div>
          <Button onClick={() => router.push("/bookings/create")} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Nueva Reserva</span>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-12 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="text-red-800 font-bold">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">Reintentar</Button>
        </div>
      ) : (
        <>
          {view === "month" && (
            <div className="bg-[var(--color-background)] rounded-[2.5rem] border border-beige shadow-xl overflow-hidden">
               <div className="grid grid-cols-7 gap-px bg-beige/30">
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => (
                  <div key={d} className="bg-[var(--color-background)] py-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{d}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-px bg-beige/30">
                {calendarDays.map((day, i) => {
                  const daySessions = sessions.filter(s => isSameDay(s.start, day.date));
                  const isTodayActive = isSameDay(new Date(), day.date);
                  
                  return (
                    <div 
                      key={i} 
                      className={`min-h-[140px] bg-[var(--color-background)] p-3 transition-colors ${!day.isCurrentMonth ? "opacity-30 bg-[var(--color-light)]/10" : "hover:bg-primary/5 cursor-pointer group"}`}
                      onClick={() => day.isCurrentMonth && router.push(`/bookings/create?date=${day.date.toISOString().split('T')[0]}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isTodayActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground group-hover:text-primary"}`}>
                          {day.date.getDate()}
                        </span>
                        {daySessions.length > 0 && (
                          <span className="text-[10px] font-bold text-muted-foreground opacity-40 px-1 bg-beige/30 rounded-md">
                            {daySessions.length} {daySessions.length === 1 ? 'Reserva' : 'Reservas'}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                        {daySessions.map(session => (
                          <div 
                            key={session.id}
                            onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${session.id}`); }}
                            style={{ backgroundColor: `${session.color}15`, borderLeft: `3px solid ${session.color}` }}
                            className="p-1 px-2 rounded-lg text-[10px] font-bold truncate group/session hover:scale-[1.02] transition-transform shadow-sm"
                          >
                            <div className="flex justify-between items-center gap-1">
                              <span className="truncate" style={{ color: session.color }}>{session.title}</span>
                              <span className="opacity-60 shrink-0">{session.start.getHours()}:{String(session.start.getMinutes()).padStart(2, '0')}</span>
                            </div>
                            <div className="text-[9px] opacity-60 truncate font-medium">{session.customer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {view === "week" && (
            <div className="bg-[var(--color-background)] rounded-[2.5rem] border border-beige shadow-xl overflow-hidden flex flex-col h-[700px]">
              <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-beige/30 border-b border-beige/50">
                <div className="bg-[var(--color-background)]" />
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = new Date(currentDate);
                  const dayOfWeek = day.getDay() || 7;
                  day.setDate(day.getDate() - (dayOfWeek - 1) + i);
                  const isTodayActive = isSameDay(new Date(), day);
                  return (
                    <div key={i} className={`bg-[var(--color-background)] py-4 text-center border-l border-beige/30 ${isTodayActive ? "bg-primary/5" : ""}`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}
                      </div>
                      <div className={`text-lg font-black mx-auto w-9 h-9 flex items-center justify-center rounded-xl ${isTodayActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-primary"}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="grid grid-cols-[100px_repeat(7,1fr)] min-h-full">
                  {/* Time labels */}
                  <div className="flex flex-col">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-20 border-b border-beige/20 text-right pr-4 pt-2 text-[10px] font-bold text-muted-foreground/50">
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>
                  
                  {/* Daily columns */}
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = new Date(currentDate);
                    const dayOfWeek = day.getDay() || 7;
                    day.setDate(day.getDate() - (dayOfWeek - 1) + dayIndex);
                    const daySessions = sessions.filter(s => isSameDay(s.start, day));
                    
                    return (
                      <div key={dayIndex} className="relative border-l border-beige/30 group">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="h-20 border-b border-beige/10 hover:bg-primary/[0.02] transition-colors" />
                        ))}
                        
                        {/* Sessions */}
                        {daySessions.map(session => {
                          const startHour = session.start.getHours();
                          const startMin = session.start.getMinutes();
                          const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60);
                          const top = (startHour * 80) + (startMin / 60 * 80);
                          const height = (duration / 60) * 80;
                          
                          return (
                            <div 
                              key={session.id}
                              onClick={() => router.push(`/bookings/${session.id}`)}
                              style={{ 
                                top: `${top}px`, 
                                height: `${height}px`,
                                backgroundColor: session.color,
                                boxShadow: `0 4px 12px ${session.color}30`
                              }}
                              className="absolute left-1 right-1 rounded-xl p-2 text-white text-[10px] font-bold overflow-hidden cursor-pointer hover:scale-[1.02] transition-all z-10 border border-white/20"
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="truncate">{session.title}</span>
                                <span className="opacity-80 shrink-0">{session.start.getHours()}:{String(session.start.getMinutes()).padStart(2, '0')}</span>
                              </div>
                              <div className="opacity-90 truncate font-medium mt-0.5">{session.customer}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === "day" && (
            <div className="bg-[var(--color-background)] rounded-[2.5rem] border border-beige shadow-xl overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 bg-[var(--color-background)] border-b border-beige/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${isSameDay(currentDate, new Date()) ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-primary/5 text-primary border border-primary/10"}`}>
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                      {currentDate.toLocaleString('es-ES', { weekday: 'short' })}
                    </span>
                    <span className="text-xl font-black">{currentDate.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary capitalize">
                        {currentDate.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        {sessions.filter(s => isSameDay(s.start, currentDate)).length} Reservas para hoy
                    </p>
                  </div>
                </div>
                <Button onClick={() => router.push("/bookings/create")} size="sm">
                    <Plus size={16} className="mr-2" />Nueva
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="grid grid-cols-[100px_1fr] min-h-full">
                  <div className="flex flex-col bg-beige/5">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-24 border-b border-beige/20 text-right pr-6 pt-4 text-[11px] font-black text-muted-foreground/40">
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative group">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-24 border-b border-beige/10 hover:bg-primary/[0.01] transition-colors" />
                    ))}
                    
                    {/* Sessions */}
                    {sessions.filter(s => isSameDay(s.start, currentDate)).map((session, i, arr) => {
                      const startHour = session.start.getHours();
                      const startMin = session.start.getMinutes();
                      const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60);
                      const top = (startHour * 96) + (startMin / 60 * 96);
                      const height = (duration / 60) * 96;
                      
                      // Simple overlap detection (naive)
                      const overlapCount = arr.filter(s => s.start < session.end && s.end > session.start).length;
                      const overlapIndex = arr.filter(s => s.start < session.end && s.end > session.start).indexOf(session);
                      const width = 96 / (overlapCount || 1);
                      const left = overlapIndex * width;

                      return (
                        <div 
                          key={session.id}
                          onClick={() => router.push(`/bookings/${session.id}`)}
                          style={{ 
                            top: `${top}px`, 
                            height: `${height}px`,
                            left: `${left + 2}%`,
                            width: `${width - 4}%`,
                            backgroundColor: session.color,
                            boxShadow: `0 8px 20px ${session.color}40`,
                            zIndex: 10 + overlapIndex
                          }}
                          className="absolute rounded-[1.25rem] p-4 text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-all border border-white/20 group/session"
                        >
                           <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-lg">{session.start.getHours()}:{String(session.start.getMinutes()).padStart(2, '0')}</span>
                            <div className="p-1.5 bg-white/20 rounded-lg group-hover/session:rotate-45 transition-transform"><Plus size={12} className="rotate-45" /></div>
                          </div>
                          <h4 className="text-base font-black truncate mb-1">{session.title}</h4>
                          <div className="flex items-center gap-2 text-xs font-bold opacity-90">
                            <Users size={12} />
                            <span className="truncate">{session.customer}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
